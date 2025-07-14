import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, MessageFlags, InteractionResponseType, PermissionFlagsBits, ApplicationCommandOptionType, ChannelType } from 'discord-api-types/v10';
import { JsonResponse, resolveImage } from '../../../Utility/utilityMethods.js';
import { createMongoClient } from '../../../Utility/utilityConstants.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { DISCORD_TOKEN } from '../../../config.js';


export const SlashCommand = {
    /** Command's Name, in fulllowercase (can include hyphens)
     * @type {String}
     */
    name: "discord-outage-feed",

    /** Command's Description
     * @type {String}
     */
    description: "Toggles receiving notifications in this Server about Discord's outages",

    /** Command's Localised Descriptions
     * @type {import('discord-api-types/v10').LocalizationMap}
     */
    localizedDescriptions: {
        'en-GB': 'Toggles receiving notifications in this Server about Discord\'s outages',
        'en-US': 'Toggles receiving notifications in this Server about Discord\'s outages'
    },

    /** Command's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 15,

    /**
     * Cooldowns for specific Subcommands
     */
    // Where "exampleName" is either the Subcommand's Name, or a combo of both Subcommand Group Name and Subcommand Name
    //  For ease in handling cooldowns, this should also include the root Command name as a prefix
    // In either "rootCommandName_subcommandName" or "rootCommandName_groupName_subcommandName" formats
    subcommandCooldown: {
        "discord-outage-feed_follow": 15,
        "discord-outage-feed_unfollow": 15
    },
    

    /** Get the Command's data in a format able to be registered with via Discord's API
     * @returns {import('discord-api-types/v10').RESTPostAPIApplicationCommandsJSONBody}
     */
    getRegisterData() {
        /** @type {import('discord-api-types/v10').RESTPostAPIApplicationCommandsJSONBody} */
        const CommandData = {};

        CommandData.name = this.name;
        CommandData.description = this.description;
        CommandData.description_localizations = this.localizedDescriptions;
        CommandData.type = ApplicationCommandType.ChatInput;
        // Integration Types - 0 for GUILD_INSTALL, 1 for USER_INSTALL.
        //  MUST include at least one. 
        CommandData.integration_types = [ ApplicationIntegrationType.GuildInstall ];
        // Contexts - 0 for GUILD, 1 for BOT_DM (DMs with the App), 2 for PRIVATE_CHANNEL (DMs/GDMs that don't include the App).
        //  MUST include at least one. PRIVATE_CHANNEL can only be used if integration_types includes USER_INSTALL
        CommandData.contexts = [ InteractionContextType.Guild ];
        // Default Permission Requirement
        CommandData.default_member_permissions = String(PermissionFlagsBits.ManageWebhooks);
        // Options
        CommandData.options = [
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "follow",
                description: "Follows the Discord Outage Notifier in this Channel",
                description_localizations: {
                    'en-GB': "Follows the Discord Outage Notifier in this Channel",
                    'en-US': "Follows the Discord Outage Notifier in this Channel"
                }
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "unfollow",
                description: "Removes the Discord Outage Notifier from this Channel",
                description_localizations: {
                    'en-GB': "Removes the Discord Outage Notifier from this Channel",
                    'en-US': "Removes the Discord Outage Notifier from this Channel"
                }
            }
        ];

        return CommandData;
    },

    /** Handles given Autocomplete Interactions, should this Command use Autocomplete Options
     * @param {import('discord-api-types/v10').APIApplicationCommandAutocompleteInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async handleAutoComplete(interaction, interactionUser) {
        return new JsonResponse({
            type: InteractionResponseType.ApplicationCommandAutocompleteResult,
            data: {
                choices: [ {name: "Not implemented yet!", value: "NOT_IMPLEMENTED"} ]
            }
        });
    },

    /** Runs the Command
     * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     * @param {String} usedCommandName 
     */
    async executeCommand(interaction, interactionUser, usedCommandName) {
        // Grab subcommand
        const InputSubcommand = interaction.data.options.find(option => option.type === ApplicationCommandOptionType.Subcommand);

        // Grab highest display name for User, for use in Audit Log entries
        let userDisplayName = interaction.member?.nick != null ? interaction.member.nick
            : interaction.member?.nick == null && interaction.member?.user.global_name != null ? interaction.member.user.global_name
            : interaction.member.user.username;

        switch (InputSubcommand.name) {
            case "follow":
                return await followFeed(interaction, interactionUser, usedCommandName, userDisplayName);
                
            case "unfollow":
                return await unfollowFeed(interaction, interactionUser, usedCommandName, userDisplayName);
        }

        return JsonResponse(null, { status: 400 });
    }
}




/** Follows the Channel this was used in to the Discord Outage Notifier
 * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction 
 * @param {import('discord-api-types/v10').APIUser} interactionUser 
 * @param {String} usedCommandName 
 * @param {String} userDisplayName 
 */
async function followFeed(interaction, interactionUser, usedCommandName, userDisplayName) {
    // Ensure this was used in a supported Channel type (Text||Public_Thread)
    if ( interaction.channel.type != ChannelType.GuildText && interaction.channel.type != ChannelType.PublicThread ) {
        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.Ephemeral,
                content: localize(interaction.locale, 'DISCORD_STATUS_COMMAND_ERROR_INVALID_CHANNEL_TYPE')
            }
        });
    }

    // Ensure App has permissions needed to create a Webhook
    const AppPerms = BigInt(interaction.app_permissions);
    // VIEW_CHANNEL
    if ( ((AppPerms & PermissionFlagsBits.ViewChannel) == PermissionFlagsBits.ViewChannel) === false ) {
        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.Ephemeral,
                content: localize(interaction.locale, 'DISCORD_STATUS_COMMAND_ERROR_MISSING_PERMISSION_VIEW_CHANNEL')
            }
        });
    }
    // MANAGE_WEBHOOKS
    if ( ((AppPerms & PermissionFlagsBits.ManageWebhooks) == PermissionFlagsBits.ManageWebhooks) === false ) {
        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.Ephemeral,
                content: localize(interaction.locale, 'DISCORD_STATUS_COMMAND_ERROR_MISSING_PERMISSION_MANAGE_WEBHOOKS')
            }
        });
    }

    // Open DB connection
    const MongoDbClient = createMongoClient();
    const TwiliteDb = MongoDbClient.db("main");

    // Check if Server is already following this feed
    try {
        const NotifierColl = TwiliteDb.collection("outage-notifier");
        const NotifierQuery = await NotifierColl.findOne({ guild_id: interaction.guild_id });
    
        // ALREADY FOLLOWING
        if ( NotifierQuery != null ) {
            await MongoDbClient.close();

            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'DISCORD_STATUS_COMMAND_ERROR_ALREADY_FOLLOWING', `</discord-outage-feed unfollow:${interaction.data.id}>`)
                }
            });
        }
        // NOT FOLLOWING
        else {
            // Attempt to create new entry
            let entryToCreate = { type: "DISCORD", guild_id: interaction.guild_id, channel_id: interaction.channel.id, webhook_id: null, webhook_token: null, in_thread: false };

            // Attempt webhook creation
            let resolvedIcon = await resolveImage("https://us-east-1.tixte.net/uploads/twilite.is-from.space/discord-outage-feed-icon-v2.png");
            let webhookCreation = await fetch(`https://discord.com/api/v10/channels/${interaction.channel.id}/webhooks`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bot ${DISCORD_TOKEN}`,
                    'X-Audit-Log-Reason': localize(interaction.guild_locale, 'DISCORD_STATUS_COMMAND_FOLLOW_SUCCESS_AUDIT_LOG', userDisplayName)
                },
                method: 'POST',
                body: JSON.stringify({
                    name: `Dis-outage Notifier`,
                    avatar: `${resolvedIcon}`
                })
            });
            let responseBody = await webhookCreation.json();

            // Successful webhook creation
            if ( webhookCreation.status === 200 || webhookCreation.status === 204 ) {
                entryToCreate.webhook_id = responseBody["id"];
                entryToCreate.webhook_token = responseBody["token"];

                // If used in a PUBLIC_THREAD Channel
                if ( interaction.channel.type === ChannelType.PublicThread ) {
                    entryToCreate.in_thread = true;
                }

                // Attempt save to DB
                try {
                    let saveToDb = await NotifierColl.insertOne(entryToCreate);
                    await MongoDbClient.close();

                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: localize(interaction.locale, 'DISCORD_STATUS_COMMAND_FOLLOW_SUCCESS', `<#${interaction.channel.id}>`)
                        }
                    });
                } catch (err) {
                    console.error(err);
                    await MongoDbClient.close();

                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: localize(interaction.locale, 'DISCORD_STATUS_COMMAND_ERROR_FOLLOW_GENERIC')
                        }
                    });
                }
            }
            // Not successful
            else {
                console.log(`[Discord Outage Notifier] Error while creating Webhook: ${webhookCreation.status} ${webhookCreation.statusText} - ${JSON.stringify(responseBody)}`);
                await MongoDbClient.close();

                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'DISCORD_STATUS_COMMAND_ERROR_FOLLOW_GENERIC')
                    }
                });
            }
        }
    } catch (err) {
        console.error(err);
        await MongoDbClient.close();

        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.Ephemeral,
                content: localize(interaction.locale, 'DISCORD_STATUS_COMMAND_ERROR_FOLLOW_GENERIC')
            }
        });
    }
}




/** Unfollows the Channel this was used in from the Discord Outage Notifier
 * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction 
 * @param {import('discord-api-types/v10').APIUser} interactionUser 
 * @param {String} usedCommandName 
 * @param {String} userDisplayName 
 */
async function unfollowFeed(interaction, interactionUser, usedCommandName, userDisplayName) {
    // Open DB connection
    const MongoDbClient = createMongoClient();
    const TwiliteDb = MongoDbClient.db("main");

    // Check if Server is following this feed
    try {
        const NotifierColl = TwiliteDb.collection("outage-notifier");
        const NotifierQuery = await NotifierColl.findOne({ type: "DISCORD", guild_id: interaction.guild_id });
    
        // IS FOLLOWING
        if ( NotifierQuery != null ) {
            // Attempt webhook deletion
            let webhookDeletion = await fetch(`https://discord.com/api/v10/webhooks/${NotifierQuery.webhook_id}/${NotifierQuery.webhook_token}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bot ${DISCORD_TOKEN}`,
                    'X-Audit-Log-Reason': localize(interaction.guild_locale, 'DISCORD_STATUS_COMMAND_UNFOLLOW_SUCCESS_AUDIT_LOG', userDisplayName)
                },
                method: 'DELETE'
            });

            // Successful webhook deletion
            if ( webhookDeletion.status === 200 || webhookDeletion.status === 204 ) {
                // Attempt to remove from DB
                try {
                    let removeFromDb = await NotifierColl.deleteOne({ type: "DISCORD", guild_id: interaction.guild_id });

                    if ( removeFromDb.deletedCount !== 1 ) {
                        await MongoDbClient.close();

                        return new JsonResponse({
                            type: InteractionResponseType.ChannelMessageWithSource,
                            data: {
                                flags: MessageFlags.Ephemeral,
                                content: localize(interaction.locale, 'DISCORD_STATUS_COMMAND_ERROR_UNFOLLOW_GENERIC', `<#${interaction.channel.id}>`)
                            }
                        });
                    }
                    else {
                        await MongoDbClient.close();

                        return new JsonResponse({
                            type: InteractionResponseType.ChannelMessageWithSource,
                            data: {
                                flags: MessageFlags.Ephemeral,
                                content: localize(interaction.locale, 'DISCORD_STATUS_COMMAND_UNFOLLOW_SUCCESS', `<#${interaction.channel.id}>`)
                            }
                        });
                    }
                    
                } catch (err) {
                    console.error(err);
                    await MongoDbClient.close();

                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: localize(interaction.locale, 'DISCORD_STATUS_COMMAND_ERROR_UNFOLLOW_GENERIC')
                        }
                    });
                }
            }
            // Not successful
            else {
                console.log(`[Discord Outage Notifier] Error while deleting Webhook: ${webhookDeletion.status} ${webhookDeletion.statusText}`);
                await MongoDbClient.close();

                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'DISCORD_STATUS_COMMAND_ERROR_UNFOLLOW_GENERIC')
                    }
                });
            }
        }
        // IS NOT FOLLOWING
        else {
            await MongoDbClient.close();

            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'DISCORD_STATUS_COMMAND_ERROR_NOT_CURRENTLY_FOLLOWING')
                }
            });
        }
    } catch (err) {
        console.error(err);
        await MongoDbClient.close();

        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.Ephemeral,
                content: localize(interaction.locale, 'DISCORD_STATUS_COMMAND_ERROR_UNFOLLOW_GENERIC')
            }
        });
    }
}
