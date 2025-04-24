import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, MessageFlags, InteractionResponseType, ApplicationCommandOptionType, ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { DISCORD_TOKEN } from '../../../config.js';


export const SlashCommand = {
    /** Command's Name, in fulllowercase (can include hyphens)
     * @type {String}
     */
    name: "follow-news",

    /** Command's Description
     * @type {String}
     */
    description: "Follows the Channel this Command is used in to TwiLite's Updates & Announcements Feed.",

    /** Command's Localised Descriptions
     * @type {import('discord-api-types/v10').LocalizationMap}
     */
    localizedDescriptions: {
        'en-GB': "Follows the Channel this Command is used in to TwiLite's Updates & Announcements Feed.",
        'en-US': "Follows the Channel this Command is used in to TwiLite's Updates & Announcements Feed."
    },

    /** Command's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 3,

    /**
     * Cooldowns for specific Subcommands
     */
    // Where "exampleName" is either the Subcommand's Name, or a combo of both Subcommand Group Name and Subcommand Name
    //  For ease in handling cooldowns, this should also include the root Command name as a prefix
    // In either "rootCommandName_subcommandName" or "rootCommandName_groupName_subcommandName" formats
    subcommandCooldown: {
        "exampleName": 3
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
        // Ensure only used in Text Channels
        if ( interaction.channel.type !== ChannelType.GuildText ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'NEWS_SUBSCRIBE_COMMAND_ERROR_NOT_A_TEXT_CHANNEL')
                }
            });
        }

        // Ensure App can actually see this Channel (so that it can follow the Announcement Feed into it)
        let appPerms = BigInt(interaction.app_permissions);
        
        if ( (appPerms & PermissionFlagsBits.ViewChannel) != PermissionFlagsBits.ViewChannel ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'NEWS_SUBSCRIBE_COMMAND_ERROR_MISSING_PERMISSION_VIEW_CHANNEL')
                }
            });
        }

        // Ensure App has MANAGE_WEBHOOKS Permission so that it can follow the Announcement Feed here
        if ( (appPerms & PermissionFlagsBits.ManageWebhooks) != PermissionFlagsBits.ManageWebhooks ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'NEWS_SUBSCRIBE_COMMAND_ERROR_MISSING_PERMISSION_MANAGE_WEBHOOKS')
                }
            });
        }


        // Do the request to follow the Announcement Channel here!
        let followFeed = await fetch(`https://discord.com/api/v10/channels/1265287246240813077/followers`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bot ${DISCORD_TOKEN}`
            },
            body: {
                webhook_channel_id: interaction.channel.id
            }
        });
        

        // Because I can't be bothered to check which of these is actually returned on successful Announcement Channel following
        if ( followFeed.status === 200 || followFeed.status === 201 || followFeed.status === 204 ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'NEWS_SUBSCRIBE_COMMAND_SUCCESS')
                }
            });
        }
        else {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'NEWS_SUBSCRIBE_COMMAND_ERROR_GENERIC')
                }
            });
        }
    }
}
