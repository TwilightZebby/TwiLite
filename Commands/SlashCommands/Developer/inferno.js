import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, MessageFlags, InteractionResponseType, PermissionFlagsBits, ApplicationCommandOptionType, EntitlementOwnerType } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { DefaultDiscordRequestHeaders } from '../../../Utility/utilityConstants.js';
import { APP_DEVELOPER_USER_ID, DISCORD_APP_USER_ID, SKU_INFERNO_ID } from '../../../config.js';


export const SlashCommand = {
    /** Command's Name, in fulllowercase (can include hyphens)
     * @type {String}
     */
    name: "inferno",

    /** Command's Description
     * @type {String}
     */
    description: "Developer-only command to manage free Inferno gifts for Servers",

    /** Command's Localised Descriptions
     * @type {import('discord-api-types/v10').LocalizationMap}
     */
    localizedDescriptions: {
        'en-GB': 'Developer-only command to manage free Inferno gifts for Servers'
    },

    /** Command's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 5,

    /**
     * Cooldowns for specific Subcommands
     */
    // Where "exampleName" is either the Subcommand's Name, or a combo of both Subcommand Group Name and Subcommand Name
    //  For ease in handling cooldowns, this should also include the root Command name as a prefix
    // In either "rootCommandName_subcommandName" or "rootCommandName_groupName_subcommandName" formats
    subcommandCooldown: {
        "inferno_grant": 5,
        "inferno_revoke": 5,
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
        // Default permission
        CommandData.default_member_permissions = String(PermissionFlagsBits.Administrator);
        // Options
        CommandData.options = [{
            type: ApplicationCommandOptionType.Subcommand,
            name: "grant",
            description: "Grants a free Inferno entitlement to the specified Server.",
            options: [{
                type: ApplicationCommandOptionType.String,
                name: "server-id",
                description: "The ID of the Server to grant Inferno to",
                required: true,
                max_length: 34
            }]
        }, {
            type: ApplicationCommandOptionType.Subcommand,
            name: "revoke",
            description: "Revokes a free Inferno entitlement from the specified Server.",
            options: [{
                type: ApplicationCommandOptionType.String,
                name: "server-id",
                description: "The ID of the Server to revoke Inferno from",
                required: true,
                max_length: 34
            }, {
                type: ApplicationCommandOptionType.String,
                name: "entitlement-id",
                description: "The Entitlement ID for Inferno in the Server",
                required: true,
                max_length: 34
            }]
        }];

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
        // Sanity check to ensure only Developer of TwiLite can use this command lmao
        if ( interaction.member?.user.id !== APP_DEVELOPER_USER_ID ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: `You do not have permission to use this Developer-only command!`
                }
            });
        }

        // Get inputs
        const Subcommand = interaction.data.options.find(option => option.type === ApplicationCommandOptionType.Subcommand);
        const InputServerId = Subcommand.options.find(option => option.name === "server-id");

        // Validate Server ID
        let queryServer = await fetch(`https://discord.com/api/v10/guilds/${InputServerId.value}`, {
            method: 'GET',
            headers: DefaultDiscordRequestHeaders
        });

        if ( queryServer.status !== 200 ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: "That was either not a valid Server ID, or TwiLite has not been added to that Server."
                }
            });
        }

        /** @type {import('discord-api-types/v10').APIGuild} */
        let fetchedServer = await queryServer.json();

        
        if ( Subcommand.name === "grant" ) {
            // Attempt Entitlement Grant
            let requestGrantEntitlement = await fetch(`https://discord.com/api/v10/applications/${DISCORD_APP_USER_ID}/entitlements`, {
                method: 'POST',
                headers: DefaultDiscordRequestHeaders,
                body: JSON.stringify({
                    "sku_id": SKU_INFERNO_ID,
                    "owner_id": InputServerId.value,
                    "owner_type": EntitlementOwnerType.Guild
                })
            })

            if ( requestGrantEntitlement.status === 200 ) {
                /** @type {import('discord-api-types/v10').APIEntitlement} */
                let grantedEntitlement = await requestGrantEntitlement.json();

                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        content: `Successfully granted Inferno to the **${fetchedServer.name}** Server with ID **${InputServerId.value}** for free!\n\nTheir Inferno Entitlement ID is: **${grantedEntitlement.id}**`
                    }
                });
            }
            else {
                console.log(`Entitlement Grant Status: ${requestGrantEntitlement.status} ${requestGrantEntitlement.statusText}`);
                console.log(JSON.stringify(await requestGrantEntitlement.json()));

                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: `Failed to grant Inferno to the **${fetchedServer.name}** Server with ID **${InputServerId.value}**`
                    }
                });
            }
        }
        else if ( Subcommand.name === "revoke" ) {
            // Grab Entitlement ID
            const InputEntitlementId = Subcommand.options.find(option => option.name === "entitlement-id");

            // Attempt Entitlement Revoke
            let requestRevokeEntitlement = await fetch(`https://discord.com/api/v10/applications/${DISCORD_APP_USER_ID}/entitlements/${InputEntitlementId.value}`, {
                method: 'DELETE',
                headers: DefaultDiscordRequestHeaders
            })

            if ( requestRevokeEntitlement.status === 200 ) {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        content: `Successfully revoked Inferno from the **${fetchedServer.name}** Server with ID **${InputServerId.value}**`
                    }
                });
            }
            else {
                console.log(`Entitlement Grant Status: ${requestRevokeEntitlement.status} ${requestRevokeEntitlement.statusText}`);
                console.log(JSON.stringify(await requestRevokeEntitlement.json()));

                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: `Failed to revoke Inferno from the **${fetchedServer.name}** Server with ID **${InputServerId.value}**`
                    }
                });
            }
        }
    }
}
