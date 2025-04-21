import { ApplicationCommandOptionType, ButtonStyle, ComponentType, InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { EmbedBuilder } from '@discordjs/builders';
import { ActionGifs } from '../Assets/ActionGifLinks.js';
import { localize } from '../Utility/localizeResponses.js';
import { JsonResponse } from '../Utility/utilityMethods.js';
import { DISCORD_APP_USER_ID } from '../config.js';

// REGEXS
const MentionEveryoneRegex = new RegExp(/@(everyone|here)/g);
const MentionRoleRegex = new RegExp(/<@&(\d{17,20})>/g);


/**
 * Tests for the Everyone/Here Mentions in a string. Optionally returns the result if slice is True
 * @param {String} string
 * @param {Boolean} [slice] True if wanting to return the matching sub-string instead of the result of the RegEx test
 * 
 * @returns {Boolean|String}
 */
function TestForEveryoneMention(string, slice) {
    if ( !slice ) {
        return MentionEveryoneRegex.test(string);
    }
    else {
        let testString = MentionEveryoneRegex.test(string);
        if ( !testString ) {
            return false;
        }
        else {
            return string.replace('@', '');
        }
    }
}


/**
 * Tests for Role Mentions in a string. Optionally returns the result if slice is True
 * @param {String} string
 * @param {Boolean} [slice] True if wanting to return the matching sub-string instead of the result of the RegEx test
 * 
 * @returns {Boolean|String}
 */
function TestForRoleMention(string, slice) {
    if ( !slice ) {
        return MentionRoleRegex.test(string);
    }
    else {
        let testString = MentionRoleRegex.test(string);
        if ( !testString ) {
            return false;
        }
        else {
            return string.replace('<@&', '').replace('>', '');
        }
    }
}




// *******
// EXPORTS

/** Runs the Command
 * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction 
 * @param {import('discord-api-types/v10').APIUser} interactionUser 
 * @param {String} usedCommandName 
 */
export async function handleActionSlashCommand(interaction, interactionUser, usedCommandName) {
    // Grab input options
    const InputTarget = interaction.data.options.find(option => option.type === ApplicationCommandOptionType.Mentionable);
    /** @type {import('discord-api-types/v10').APIApplicationCommandInteractionDataBooleanOption|undefined}*/
    const InputIncludeGif = interaction.data.options.find(option => option.name === "include-gif");
    const InputReason = interaction.data.options.find(option => option.type === ApplicationCommandOptionType.String);
    /** @type {import('discord-api-types/v10').APIApplicationCommandInteractionDataBooleanOption|undefined}*/
    const InputBlockReturn = interaction.data.options.find(option => option.name === "block-return");

    // Just for ease
    const InteractionTriggeringUserId = interaction.member != undefined ? interaction.member.user.id : interaction.user.id;
    const InteractionTriggeringUserDisplayName = interaction.member != undefined && interaction.member.nick != null ? interaction.member.nick
        : interaction.member != undefined && interaction.member.nick == null && interaction.member.user.global_name != null ? interaction.member.user.global_name
        : interaction.member != undefined && interaction.member.nick == null && interaction.member.user.global_name == null ? interaction.member.user.username
        : interaction.member == undefined && interaction.user.global_name != null ? interaction.user.global_name
        : interaction.user.username;

    // Override for GIF-less responses - such as when target is a Role, as to prevent accidental Role Pings should the `allow_mentions` field break.
    //   Also, prevents Server Modmins from freaking out even though the Role wasn't actually pinged, just mentioned, since it'll be in an embed NOT in the content field.
    let forceDisplayEmbed = false;
    // For assembling the displayed message content
    let displayMessage = "";

    // Create Return Action button, for when it is allowed to be included in response
    let returnActionComponent = {
        "id": 10,
        "type": ComponentType.ActionRow,
        "components": [{
            "id": 11,
            "type": ComponentType.Button,
            "style": ButtonStyle.Primary,
            "label": localize(interaction.guild_locale != undefined ? interaction.guild_locale : interaction.locale, `ACTION_RETURN_BUTTON_LABEL_${interaction.data.name.toUpperCase()}`),
            "custom_id": `return-action_${interaction.data.name.toUpperCase()}_${InteractionTriggeringUserId}_${InputTarget.value}`
        }]
    };


    // atEveryone
    if ( InputTarget.value === interaction.guild_id ) {
        displayMessage = localize('en-GB', `ACTION_COMMAND_EVERYONE_${interaction.data.name.toUpperCase()}`, InteractionTriggeringUserDisplayName);
    }
    // atRole
    else if ( interaction.data.resolved.roles?.[InputTarget.value] != undefined ) {
        forceDisplayEmbed = true;
        displayMessage = localize('en-GB', `ACTION_COMMAND_ROLE_${interaction.data.name.toUpperCase()}`, InteractionTriggeringUserDisplayName, `<@&${InputTarget.value}>`);
    }
    // atUser (used on self)
    else if ( InputTarget.value === InteractionTriggeringUserId ) {
        displayMessage = localize('en-GB', `ACTION_COMMAND_SELF_USER_${interaction.data.name.toUpperCase()}`, InteractionTriggeringUserDisplayName);
    }
    // atUser (used on this app)
    else if ( InputTarget.value === DISCORD_APP_USER_ID ) {
        displayMessage = localize('en-GB', `ACTION_COMMAND_TWILITE_${interaction.data.name.toUpperCase()}`, InteractionTriggeringUserDisplayName);
    }
    // atUser (used on the yucky Mee6 app)
    else if ( InputTarget.value === '159985870458322944' ) {
        displayMessage = localize('en-GB', `ACTION_COMMAND_MEE6_${interaction.data.name.toUpperCase()}`, InteractionTriggeringUserDisplayName, `<@159985870458322944>`);
    }
    // atUser (used on any app that isn't TwiLite or Mee6)
    else if ( interaction.data.resolved.users?.[InputTarget.value]?.bot === true ) {
        displayMessage = localize('en-GB', `ACTION_COMMAND_OTHER_APPS_${interaction.data.name.toUpperCase()}`, InteractionTriggeringUserDisplayName, `<@${InputTarget.value}>`);
    }
    // atUser (used on any human User)
    else {
        // Just so their highest display name can be gained
        let targetDisplayName = "";
        if ( interaction.data.resolved.members != undefined && interaction.data.resolved.members[InputTarget.value].nick != null ) { targetDisplayName = interaction.data.resolved.members[InputTarget.value].nick; }
        else if ( interaction.data.resolved.members != undefined && interaction.data.resolved.members[InputTarget.value].nick == null && interaction.data.resolved.users[InputTarget.value].global_name != null ) { targetDisplayName = interaction.data.resolved.users[InputTarget.value].global_name; }
        else if ( interaction.data.resolved.members != undefined && interaction.data.resolved.members[InputTarget.value].nick == null && interaction.data.resolved.users[InputTarget.value].global_name == null ) { targetDisplayName = interaction.data.resolved.users[InputTarget.value].username; }
        else if ( interaction.data.resolved.members == undefined && interaction.data.resolved.users[InputTarget.value].global_name != null ) { targetDisplayName = interaction.data.resolved.users[InputTarget.value].global_name; }
        else { targetDisplayName = interaction.data.resolved.users[InputTarget.value].username; }

        displayMessage = localize('en-GB', `ACTION_COMMAND_OTHER_USER_${interaction.data.name.toUpperCase()}`, InteractionTriggeringUserDisplayName, targetDisplayName);
    }


    // If a custom message is given, check for sneaky atMentions!
    if ( InputReason != undefined ) {
        if ( TestForEveryoneMention(InputReason.value) ) { forceDisplayEmbed = true; }
        if ( TestForRoleMention(InputReason.value) ) { forceDisplayEmbed = true; }
        displayMessage += ` ${InputReason.value}`;
    }


    // GIF was requested to be included
    let wasGifRequested = false;
    if ( InputIncludeGif != undefined ) {
        if ( InputIncludeGif?.value === true ) { wasGifRequested = true; }
    }

    if ( wasGifRequested ) {
        // Create Components v2 response
        let gifComponent = {
            "id": 1,
            "type": ComponentType.Container,
            "accent_color": interaction.data.resolved.roles?.[InputTarget.value] != undefined ? interaction.data.resolved.roles[InputTarget.value].color : null,
            "spoiler": false,
            "components": [
                {
                    "id": 2,
                    "type": ComponentType.Section,
                    "components": [
                        {
                            "id": 3,
                            "type": ComponentType.TextDisplay,
                            "content": displayMessage
                        }
                    ],
                    "accessory": {
                        "id": 4,
                        "type": ComponentType.Thumbnail,
                        "media": {
                            "url": ActionGifs[interaction.data.name][Math.floor(( Math.random() * ActionGifs[interaction.data.name].length ) + 0)]
                        },
                        "spoiler": false
                    }
                }
            ]
        };

        // Check for Return Action button allowance
        if ( InputBlockReturn == undefined || (InputBlockReturn != undefined && InputBlockReturn.value === false) ) {
            gifComponent.components.push(returnActionComponent);
        }

        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.IsComponentsV2,
                components: [gifComponent],
                allowed_mentions: { parse: [], users: ['159985870458322944'] }
            }
        });
    }
    // GIF was NOT requested
    else {
        // Embed was force-enabled
        if ( forceDisplayEmbed ) {
            // Create Components v2 response
            let actionComponent = {
                "id": 1,
                "type": ComponentType.Container,
                "accent_color": interaction.data.resolved.roles?.[InputTarget.value] != undefined ? interaction.data.resolved.roles[InputTarget.value].color : null,
                "spoiler": false,
                "components": [
                    {
                        "id": 2,
                        "type": ComponentType.TextDisplay,
                        "content": displayMessage
                    }
                ]
            };

            // Check for Return Action button allowance
            if ( InputBlockReturn == undefined || (InputBlockReturn != undefined && InputBlockReturn.value === true) ) {
                actionComponent.components.push(returnActionComponent);
            }

            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.IsComponentsV2,
                    components: [actionComponent],
                    allowed_mentions: { parse: [], users: ['159985870458322944'] }
                }
            });
        }
        // Embed not force-enabled
        else {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: displayMessage,
                    allowed_mentions: { parse: [], users: ['159985870458322944'] },
                    components: ( InputBlockReturn == undefined || (InputBlockReturn != undefined && InputBlockReturn.value === true) ) ? [returnActionComponent] : undefined
                }
            });
        }
    }
}
