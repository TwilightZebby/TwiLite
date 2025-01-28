import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, MessageFlags, InteractionResponseType, ApplicationCommandOptionType } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';


export const SlashCommand = {
    /** Command's Name, in fulllowercase (can include hyphens)
     * @type {String}
     */
    name: "temperature",

    /** Command's Description
     * @type {String}
     */
    description: "Convert a given temperature between degrees C, F, and K",

    /** Command's Localised Descriptions
     * @type {import('discord-api-types/v10').LocalizationMap}
     */
    localizedDescriptions: {
        'en-GB': 'Convert a given temperature between degrees C, F, and K',
        'en-US': 'Convert a given temperature between degrees F, C, and K'
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
        CommandData.contexts = [ InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM ];
        // Options
        CommandData.options = [
            {
                type: ApplicationCommandOptionType.Integer,
                name: "value",
                description: "The temperature value you want to convert",
                description_localizations: {
                    'en-GB': "The temperature value you want to convert",
                    'en-US': "The temperature value you want to convert"
                },
                min_value: -460,
                max_value: 1000,
                required: true
            },
            {
                type: ApplicationCommandOptionType.String,
                name: "scale",
                description: "The temperature scale of the original value",
                description_localizations: {
                    'en-GB': "The temperature scale of the original value",
                    'en-US': "The temperature scale of the original value"
                },
                required: true,
                choices: [
                    {
                        name: "Celsius",
                        name_localizations: {
                            'en-GB': "Celsius",
                            'en-US': "Celsius"
                        },
                        value: "CELSIUS"
                    },
                    {
                        name: "Fahernheit",
                        name_localizations: {
                            'en-GB': "Fahernheit",
                            'en-US': "Fahernheit"
                        },
                        value: "FAHERNHEIT"
                    },
                    {
                        name: "Kelvin",
                        name_localizations: {
                            'en-GB': "Kelvin",
                            'en-US': "Kelvin"
                        },
                        value: "KELVIN"
                    }
                ]
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
        // Grab inputs
        const InputValue = interaction.data.options.find(option => option.type === ApplicationCommandOptionType.Integer);
        const InputScale = interaction.data.options.find(option => option.type === ApplicationCommandOptionType.String);


        // Convert
        switch (InputScale)
        {
            // C TO F/K
            case "CELSIUS":
                const CToF = (InputValue * 9/5) + 32;
                const CToK = InputValue + 273.15;
                if ( CToK < 0 ) {
                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: localize(interaction.locale, 'TEMPERATURE_COMMAND_ERROR_INVALID_TEMPERATURE', `${InputValue}`, 'C')
                        }
                    });
                }

                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'TEMPERATURE_COMMAND_CONVERTED', `${InputValue}`, 'C', `${CToF.toFixed(0)}`, 'F', `${CToK.toFixed(0)}`, 'K')
                    }
                });

            // F TO C/K
            case "FAHERNHEIT":
                const FToC = (InputValue - 32) * 5/9;
                const FToK = (InputValue - 32) * 5/9 + 273.15;
                if ( FToK < 0 ) {
                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: localize(interaction.locale, 'TEMPERATURE_COMMAND_ERROR_INVALID_TEMPERATURE', `${InputValue}`, 'F')
                        }
                    });
                }

                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'TEMPERATURE_COMMAND_CONVERTED', `${InputValue}`, 'F', `${FToC.toFixed(0)}`, 'C', `${FToK.toFixed(0)}`, 'K')
                    }
                });

            // K TO C/F
            case "KELVIN":
                const KToC = InputValue - 273.15;
                const KToF = (InputValue - 273.15) * 9/5 + 32;
                if ( InputValue < 0 ) {
                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: localize(interaction.locale, 'TEMPERATURE_COMMAND_ERROR_INVALID_TEMPERATURE', `${InputValue}`, 'K')
                        }
                    });
                }

                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'TEMPERATURE_COMMAND_CONVERTED', `${InputValue}`, 'K', `${KToC.toFixed(0)}`, 'C', `${KToF.toFixed(0)}`, 'F')
                    }
                });

            default:
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'ERROR_GENERIC')
                    }
                });
        }
    }
}
