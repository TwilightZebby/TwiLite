import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, MessageFlags, InteractionResponseType, ApplicationCommandOptionType } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { handleActionSlashCommand } from '../../../Modules/ActionModule.js';
import { localize } from '../../../Utility/localizeResponses.js';


export const SlashCommand = {
    /** Command's Name, in fulllowercase (can include hyphens)
     * @type {String}
     */
    name: "hug",

    /** Command's Description
     * @type {String}
     */
    description: "Hug the selected target",

    /** Command's Localised Descriptions
     * @type {import('discord-api-types/v10').LocalizationMap}
     */
    localizedDescriptions: {
        'en-GB': 'Hug the selected target',
        'en-US': 'Hug the selected target'
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
        CommandData.integration_types = [ ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall ];
        // Contexts - 0 for GUILD, 1 for BOT_DM (DMs with the App), 2 for PRIVATE_CHANNEL (DMs/GDMs that don't include the App).
        //  MUST include at least one. PRIVATE_CHANNEL can only be used if integration_types includes USER_INSTALL
        CommandData.contexts = [ InteractionContextType.Guild, InteractionContextType.PrivateChannel ];
        // Options
        CommandData.options = [
            {
                type: ApplicationCommandOptionType.Mentionable,
                name: "target",
                description: "The target you want to hug",
                description_localizations: {
                    'en-GB': "The target you want to hug",
                    'en-US': "The target you want to hug"
                },
                required: true
            },
            {
                type: ApplicationCommandOptionType.Boolean,
                name: "include-gif",
                description: "Should a random GIF be displayed? (default: false)",
                description_localizations: {
                    'en-GB': "Should a random GIF be displayed? (default: false)",
                    'en-US': "Should a random GIF be displayed? (default: false)"
                },
                required: false
            },
            {
                type: ApplicationCommandOptionType.Boolean,
                name: "block-return",
                description: "Set to TRUE to prevent the \"Return Hug\" Button from being included in the response",
                description_localizations: {
                    'en-GB': "Set to TRUE to prevent the \"Return Hug\" Button from being included in the response",
                    'en-US': "Set to TRUE to prevent the \"Return Hug\" Button from being included in the response"
                },
                required: false
            },
            {
                type: ApplicationCommandOptionType.String,
                name: "reason",
                description: "An optional custom reason to be added onto the end of the displayed message",
                description_localizations: {
                    'en-GB': "An optional custom reason to be added onto the end of the displayed message",
                    'en-US': "An optional custom reason to be added onto the end of the displayed message"
                },
                required: false,
                max_length: 500
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
        try {
            return await handleActionSlashCommand(interaction, interactionUser, usedCommandName);
        }
        catch (err) {
            console.error(err);
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'SLASH_COMMAND_ERROR_GENERIC')
                }
            });
        }

        return;
    }
}
