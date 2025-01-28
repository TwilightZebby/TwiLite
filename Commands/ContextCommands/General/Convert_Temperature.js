import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, MessageFlags, InteractionResponseType, MessageReferenceType } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { SystemMessageTypes } from '../../../Utility/utilityConstants.js';

// REGEXS
const TemperatureRegex = new RegExp(/(?<amount>-?\d+(?:\.\d*)?)[^\S\n]*(?<degrees>°|'|deg(?:rees?)?|in)?[^\S\n]*(?<unit>c(?:(?=el[cs]ius\b|entigrades?\b|\b))|f(?:(?=ahrenheit\b|\b))|k(?:(?=elvins?\b|\b)))/gi);
const CelsiusRegex = new RegExp(/(?<amount>-?\d+(?:\.\d*)?)[^\S\n]*(?<degrees>°|'|deg(?:rees?)?|in)?[^\S\n]*(?<unit>c(?:(?=el[cs]ius\b|entigrades?\b|\b)))/gi);
const FahernheitRegex = new RegExp(/(?<amount>-?\d+(?:\.\d*)?)[^\S\n]*(?<degrees>°|'|deg(?:rees?)?|in)?[^\S\n]*(?<unit>f(?:(?=ahrenheit\b|\b)))/gi);
const KelvinRegex = new RegExp(/(?<amount>-?\d+(?:\.\d*)?)[^\S\n]*(?<degrees>°|'|deg(?:rees?)?|in)?[^\S\n]*(?<unit>k(?:(?=elvins?\b|\b)))/gi);


/**
 * Converts given temperature
 * @param {String} originalTemperature 
 * @param {String} locale Locale from Context Command
 * @returns {String}
 */
function convertTemperature(originalTemperature, locale)
{
    // Grab original scale
    let originalScale = "";
    if ( CelsiusRegex.test(originalTemperature) ) { originalScale = "c"; }
    else if ( FahernheitRegex.test(originalTemperature) ) { originalScale = "f"; }
    else if ( KelvinRegex.test(originalTemperature) ) { originalScale = "k"; }

    // Grab original numerical value of Temperature
    let originalValue = originalTemperature.match(new RegExp(/[0-9.\-]/gi));
    originalValue = originalValue.join('');
    originalValue = parseInt(originalValue);


    // CONVERT! :D
    if ( originalScale === "c" )
    {
        const CToF = ( originalValue * 9/5 ) + 32;
        const CToK = originalValue + 273.15;
        // Check for invalid Temperature
        if ( CToK < 0 ) { return localize(locale, 'TEMPERATURE_COMMAND_ERROR_INVALID_TEMPERATURE', `${originalValue}`, 'C'); }
        // Return converted temperatures
        //return `${originalValue}C is about ${CToF.toFixed(0)}F or ${CToK.toFixed(0)}K`;
        return localize(locale, 'TEMPERATURE_COMMAND_CONVERTED', `${originalValue}`, 'C', `${CToF.toFixed(0)}`, 'F', `${CToK.toFixed(0)}`, 'K');
    }
    else if ( originalScale === "f" )
    {
        const FToC = ( originalValue - 32 ) * 5/9;
        const FToK = ( originalValue - 32 ) * 5/9 + 273.15;
        // Check for invalid Temperature
        if ( FToK < 0 ) { return localize(locale, 'TEMPERATURE_COMMAND_ERROR_INVALID_TEMPERATURE', `${originalValue}`, 'F'); }
        // Return converted temperatures
        return localize(locale, 'TEMPERATURE_COMMAND_CONVERTED', `${originalValue}`, 'F', `${FToC.toFixed(0)}`, 'C', `${FToK.toFixed(0)}`, 'K');
    }
    else if ( originalScale === "k" )
    {
        const KToC = originalValue - 273.15;
        const KToF = ( originalValue - 273.15 ) * 9/5 + 32;
        // Check for invalid Temperature
        if ( originalValue < 0 ) { return localize(locale, 'TEMPERATURE_COMMAND_ERROR_INVALID_TEMPERATURE', `${originalValue}`, 'K'); }
        // Return converted temperatures
        return localize(locale, 'TEMPERATURE_COMMAND_CONVERTED', `${originalValue}`, 'K', `${KToC.toFixed(0)}`, 'C', `${KToF.toFixed(0)}`, 'F');
    }
}


export const ContextCommand = {
    /** Command's Name, supports both upper- and lower-case, and spaces
     * @type {String}
     */
    name: "Convert Temperature",

    /** Command's Description
     * @type {String}
     */
    description: "Convert temperatures detected within sent Messages",

    /** Type of Context Command
     * @type {ApplicationCommandType}
     */
    commandType: ApplicationCommandType.Message,

    /** Command's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 5,
    

    /** Get the Command's data in a format able to be registered with via Discord's API
     * @returns {import('discord-api-types/v10').RESTPostAPIApplicationCommandsJSONBody}
     */
    getRegisterData() {
        /** @type {import('discord-api-types/v10').RESTPostAPIApplicationCommandsJSONBody} */
        const CommandData = {};

        CommandData.name = this.name;
        CommandData.description = "";
        CommandData.type = this.commandType;
        // Integration Types - 0 for GUILD_INSTALL, 1 for USER_INSTALL.
        //  MUST include at least one. 
        CommandData.integration_types = [ ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall ];
        // Contexts - 0 for GUILD, 1 for BOT_DM (DMs with the App), 2 for PRIVATE_CHANNEL (DMs/GDMs that don't include the App).
        //  MUST include at least one. PRIVATE_CHANNEL can only be used if integration_types includes USER_INSTALL
        CommandData.contexts = [ InteractionContextType.Guild, InteractionContextType.PrivateChannel ];

        return CommandData;
    },

    /** Runs the Command
     * @param {import('discord-api-types/v10').APIMessageApplicationCommandGuildInteraction|import('discord-api-types/v10').APIMessageApplicationCommandDMInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeCommand(interaction, interactionUser) {
        // Grab Message
        const SourceMessage = interaction.data.resolved.messages[interaction.data.target_id];

        // Validate not an App/System Message
        if ( SourceMessage.author.bot || SourceMessage.author.system || SystemMessageTypes.includes(SourceMessage.type) ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'CONTEXT_COMMAND_ERROR_SYSTEM_AND_BOT_MESSAGES_UNSUPPORTED')
                }
            });
        }

        // Validate not a Poll Message
        if ( SourceMessage.poll != undefined ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'TEMPERATURE_COMMAND_ERROR_POLLS_NOT_SUPPORTED')
                }
            });
        }

        // Validate not a Forwarded Message
        if ( SourceMessage.message_reference?.type === MessageReferenceType.Forward ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'TEMPERATURE_COMMAND_ERROR_FORWARDS_NOT_SUPPORTED')
                }
            });
        }

        // Validate there is actually content in this Message
        if ( !SourceMessage.content || SourceMessage.content == '' ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'CONTEXT_COMMAND_ERROR_MISSING_CONTENT')
                }
            });
        }

        
        // Check for temperatures in the Message
        const MatchedTemperatures = SourceMessage.content.match(TemperatureRegex);

        // If no temperatures found, ACK early
        if ( !MatchedTemperatures || MatchedTemperatures == null ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'TEMPERATURE_COMMAND_ERROR_TEMPERATURE_NOT_FOUND')
                }
            });
        }
        // If more than 10 temperatures were found
        else if ( MatchedTemperatures.length > 10 ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'TEMPERATURE_COMMAND_ERROR_EXCEEDED_TEMPERATURE_LIMIT')
                }
            });
        }
        // If one single temperature was found
        else if ( MatchedTemperatures.length === 1 ) {
            const ConvertedResult = convertTemperature(MatchedTemperatures.shift(), interaction.locale);
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: `[${localize(interaction.locale, 'JUMP_TO_SOURCE_MESSAGE')}](<https://discord.com/channels/${interaction.guild_id}/${interaction.channel.id}/${SourceMessage.id}>)\n${localize(interaction.locale, 'TEMPERATURE_COMMAND_SUCCESS_SINGLAR')}\n\n- ${ConvertedResult}`
                }
            });
        }
        // If between 2 and 10 temperatures were found (inclusive)
        else {
            let convertedResults = [];

            MatchedTemperatures.forEach(item => {
                let tempResult = convertTemperature(item, interaction.locale);
                // WHILE statement kept from MooBot v5 (added January 2022). I STILL DON'T KNOW WHY IT BREAKS WITHOUT THIS WHILE STATEMENT!
                // Link to MooBot v5 for the curious: https://github.com/TwilightZebby/MooBot/releases/tag/5.0.0
                while ( !tempResult || tempResult == undefined || tempResult == null ) { tempResult = convertTemperature(item, interaction.locale); }
                convertedResults.push(`- ${tempResult}`);
            });

            // ACK results
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: `[${localize(interaction.locale, 'JUMP_TO_SOURCE_MESSAGE')}](<https://discord.com/channels/${interaction.guild_id}/${interaction.channel.id}/${SourceMessage.id}>)\n${localize(interaction.locale, 'TEMPERATURE_COMMAND_SUCCESS_MULTIPLE')}\n\n${convertedResults.join(`\n`)}`
                }
            });
        }
    }
}
