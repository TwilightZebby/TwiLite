import { ButtonStyle, ComponentType, InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { JsonResponse, randomNumberInRange } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { IMAGE_JAIL_CELLBARS } from '../../../Assets/Hyperlinks.js';


export const Button = {
    /** The Button's name - set as the START of the Button's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "buttonName_extraData"
     * @type {String}
     */
    name: "jail",

    /** Button's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles the Jail Minigame",

    /** Button's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 3,

    /** Runs the Button
     * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeButton(interaction, interactionUser) {
        // Grab data
        console.log(interaction.data.custom_id);
        let splitCustomData = interaction.data.custom_id.split("_");
        const OriginalSenderId = interaction.message.interaction_metadata.user.id;
        const OriginalSenderDisplayName = splitCustomData.pop();
        const OriginalTargetId = splitCustomData.pop();
        const OriginalTargetDisplayName = splitCustomData.pop();

        const MinigameAction = splitCustomData.pop();
        let messageComponents = interaction.message.components;
        const OriginalJailText = messageComponents[0].components[0].components[1].content;

        const InteractionUserDisplayName = interaction.member != undefined && interaction.member.nick != null ? interaction.member.nick
            : interaction.member != undefined && interaction.member.nick == null && interaction.member.user.global_name != null ? interaction.member.user.global_name
            : interaction.member != undefined && interaction.member.nick == null && interaction.member.user.global_name == null ? interaction.member.user.username
            : interaction.member == undefined && interaction.user.global_name != null ? interaction.user.global_name
            : interaction.user.username;
        
        // Just to set a default
        /** @type {import('discord-api-types/v10').APIMessageTopLevelComponent[]} */
        let editComponents = [{
            "id": 1,
            "type": ComponentType.Container,
            "spoiler": false,
            "components": [
                {
                    "id": 2,
                    "type": ComponentType.Section,
                    "accessory": {
                        "type": ComponentType.Thumbnail,
                        "media": { "url": IMAGE_JAIL_CELLBARS }
                    },
                    "components": [{
                        "id": 3,
                        "type": ComponentType.TextDisplay,
                        "content": `${OriginalJailText}`
                    }, {
                        "id": 4,
                        "type": ComponentType.TextDisplay,
                        "content": `\u200B`
                    }, {
                        "id": 5,
                        "type": ComponentType.TextDisplay,
                        "content": `\u200B`
                    }]
                },
                {
                    "id": 6,
                    "type": ComponentType.ActionRow,
                    "components": [
                        {
                            "id": 7,
                            "type": ComponentType.Button,
                            "style": ButtonStyle.Secondary,
                            "custom_id": `jail_ba_${OriginalTargetDisplayName}_${OriginalTargetId}_${OriginalSenderDisplayName}`,
                            "label": localize(interaction.locale, 'ACTION_JAIL_MINIGAME_BAIL_BUTTON_LABEL'),
                            "disabled": false
                        },
                        {
                            "id": 8,
                            "type": ComponentType.Button,
                            "style": ButtonStyle.Secondary,
                            "custom_id": `jail_br_${OriginalTargetDisplayName}_${OriginalTargetId}_${OriginalSenderDisplayName}`,
                            "label": localize(interaction.locale, 'ACTION_JAIL_MINIGAME_BREAKOUT_BUTTON_LABEL'),
                            "disabled": false
                        }
                    ]
                }
            ]
        }];

        // Grab a random number to use as what picks the response
        let randomPhrase = randomNumberInRange(0, 100);

        // Edit components depending on which Button was pressed
        if ( MinigameAction === "ba" ) {
            // Ensure original target wasn't the one who pressed this
            if ( interactionUser.id === OriginalTargetId ) {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'ACTION_ERROR_JAIL_MINIGAME_CANNOT_BAIL_SELF')
                    }
                });
            }

            // Responses for when original sender presses button
            if ( interactionUser.id === OriginalSenderId ) {
                if ( randomPhrase <= 30 ) {
                    // Successful bail
                    editComponents[0].components[0].components[2].content = localize(interaction.guild_locale, 'ACTION_JAIL_MINIGAME_BAIL_SENDER_SUCCESSFUL', OriginalSenderDisplayName, OriginalTargetDisplayName);
                    editComponents[0].components[1].components[0].disabled = true;
                    editComponents[0].components[1].components[1].disabled = true;
                }
                else {
                    // Failed bail
                    editComponents[0].components[0].components[2].content = localize(interaction.guild_locale, 'ACTION_JAIL_MINIGAME_BAIL_SENDER_FAILURE', OriginalSenderDisplayName, OriginalTargetDisplayName);
                    editComponents[0].components[1].components[0].disabled = true;
                    editComponents[0].components[1].components[1].disabled = true;
                }
            }
            // Responses for when other users press the button
            else {
                if ( randomPhrase <= 30 ) {
                    // Successful bail
                    editComponents[0].components[0].components[2].content = localize(interaction.guild_locale, 'ACTION_JAIL_MINIGAME_BAIL_OTHER_SUCCESSFUL', InteractionUserDisplayName, OriginalTargetDisplayName);
                    editComponents[0].components[1].components[0].disabled = true;
                    editComponents[0].components[1].components[1].disabled = true;
                }
                else {
                    // Failed bail
                    editComponents[0].components[0].components[2].content = localize(interaction.guild_locale, 'ACTION_JAIL_MINIGAME_BAIL_OTHER_FAILURE', InteractionUserDisplayName, OriginalTargetDisplayName);
                    editComponents[0].components[1].components[0].disabled = true;
                    editComponents[0].components[1].components[1].disabled = true;
                }
            }
        }
        else if ( MinigameAction === "br" ) {
            // Responses for when original target presses the button
            if ( interactionUser.id === OriginalTargetId ) {
                if ( randomPhrase <= 30 ) {
                    // Successful breakout
                    editComponents[0].components[0].components[2].content = localize(interaction.guild_locale, 'ACTION_JAIL_MINIGAME_BREAKOUT_TARGET_SUCCESSFUL', OriginalTargetDisplayName);
                    editComponents[0].components[1].components[1].disabled = true;
                    editComponents[0].components[1].components[0].disabled = true;
                }
                else {
                    // Failed breakout
                    editComponents[0].components[0].components[2].content = localize(interaction.guild_locale, 'ACTION_JAIL_MINIGAME_BREAKOUT_TARGET_FAILURE', OriginalTargetDisplayName);
                    editComponents[0].components[1].components[1].disabled = true;
                    editComponents[0].components[1].components[0].disabled = true;
                }
            }
            // Responses for when original sender presses button
            else if ( interactionUser.id === OriginalSenderId ) {
                if ( randomPhrase <= 30 ) {
                    // Successful breakout
                    editComponents[0].components[0].components[2].content = localize(interaction.guild_locale, 'ACTION_JAIL_MINIGAME_BREAKOUT_SENDER_SUCCESSFUL', OriginalSenderDisplayName, OriginalTargetDisplayName);
                    editComponents[0].components[1].components[1].disabled = true;
                    editComponents[0].components[1].components[0].disabled = true;
                }
                else {
                    // Failed breakout
                    editComponents[0].components[0].components[2].content = localize(interaction.guild_locale, 'ACTION_JAIL_MINIGAME_BREAKOUT_SENDER_FAILURE', OriginalSenderDisplayName, OriginalTargetDisplayName);
                    editComponents[0].components[1].components[1].disabled = true;
                    editComponents[0].components[1].components[0].disabled = true;
                }
            }
            // Responses for when other users press the button
            else {
                if ( randomPhrase <= 30 ) {
                    // Successful breakout
                    editComponents[0].components[0].components[2].content = localize(interaction.guild_locale, 'ACTION_JAIL_MINIGAME_BREAKOUT_OTHER_SUCCESSFUL', InteractionUserDisplayName, OriginalTargetDisplayName);
                    editComponents[0].components[1].components[1].disabled = true;
                    editComponents[0].components[1].components[0].disabled = true;
                }
                else {
                    // Failed breakout
                    editComponents[0].components[0].components[2].content = localize(interaction.guild_locale, 'ACTION_JAIL_MINIGAME_BREAKOUT_OTHER_FAILURE', InteractionUserDisplayName, OriginalTargetDisplayName);
                    editComponents[0].components[1].components[1].disabled = true;
                    editComponents[0].components[1].components[0].disabled = true;
                }
            }
        }

        return new JsonResponse({
            type: InteractionResponseType.UpdateMessage,
            data: {
                flags: MessageFlags.IsComponentsV2,
                components: editComponents,
                allowed_mentions: { parse: [] }
            }
        });
    }
}
