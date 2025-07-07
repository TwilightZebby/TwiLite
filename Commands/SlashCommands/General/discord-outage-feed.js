import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, MessageFlags, InteractionResponseType, PermissionFlagsBits, ApplicationCommandOptionType } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';


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
        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.Ephemeral,
                content: "This Command has not yet been implemented yet!"
            }
        });
    }
}
