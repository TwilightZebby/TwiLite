import { ButtonStyle, InteractionResponseType } from 'discord-api-types/v10';
import * as EmojiRegex from 'emoji-regex';
import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { DiscordEmojiRegex, OriginalInteractionResponseEndpoint, UtilityCollections } from '../../../Utility/utilityConstants.js';
import { EMOJIPEDIA_URI } from '../../../Assets/Hyperlinks.js';
import { DISCORD_APP_USER_ID, DISCORD_TOKEN } from '../../../config.js';


export const Modal = {
    /** The Modals's name - set as the START of the Modal's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "modalName_extraData"
     * @type {String}
     */
    name: "menu-button-text",

    /** Modal's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles grabbing the Button label/emoji for new Role Buttons on Role Menus",

    /** Runs the Modal
     * @param {import('discord-api-types/v10').APIModalSubmitGuildInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeModal(interaction, interactionUser) {
        // Grab inputs
        const SplitCustomId = interaction.data.custom_id.split("_");
        const ButtonType = SplitCustomId.pop();
        const RoleId = SplitCustomId.pop();
        let inputLabel;
        let inputEmoji;
        interaction.data.components.forEach(modalRow => {
            modalRow.components.forEach(modalComponent => {
                if ( modalComponent.custom_id === "label" ) { inputLabel = modalComponent.value; }
                else if ( modalComponent.custom_id === "emoji" ) { inputEmoji = modalComponent.value; }
            });
        });

        
        // Validate that at least ONE input was given
        if ( (inputLabel == "" && inputLabel == " " && inputLabel == null && inputLabel == undefined) && (inputEmoji == "" && inputEmoji == " " && inputEmoji == null && inputEmoji == undefined) ) {
            return new JsonResponse({
                type: InteractionResponseType.UpdateMessage,
                data: {
                    content: `${localize(interaction.locale, 'ROLE_MENU_BUTTON_SET_INSTRUCTIONS', `<@&${RoleId}>`)}\n\n${localize(interaction.locale, 'ROLE_MENU_ERROR_CANNOT_HAVE_BLANK_BUTTON')}`
                }
            });
        }


        // Validate Emoji, if one was given
        if ( inputEmoji != "" && inputEmoji != " " && inputEmoji != null && inputEmoji != undefined ) {
            if ( !DiscordEmojiRegex.test(inputEmoji) && !EmojiRegex.default().test(inputEmoji) ) {
                return new JsonResponse({
                    type: InteractionResponseType.UpdateMessage,
                    data: {
                        content: `${localize(interaction.locale, 'ROLE_MENU_BUTTON_SET_INSTRUCTIONS', `<@&${RoleId}>`)}\n\n${localize(interaction.locale, 'ROLE_MENU_ERROR_INVALID_EMOJI', `<${EMOJIPEDIA_URI}>`)}`
                    }
                });
            }
        }


        // New Button details are validated. Now, construct the new Button and add to Menu!
        // ...after fetching the current Menu's details first
        const UserId = interaction.member.user.id;
        let originalResponse = UtilityCollections.RoleMenuManagement.get(UserId);

        
        // Construct new button
        const NewRoleButton = new ButtonBuilder().setCustomId(`role_${RoleId}`)
        .setStyle(ButtonType === 'blurple' ? ButtonStyle.Primary : ButtonType === 'green' ? ButtonStyle.Success : ButtonType === 'grey' ? ButtonStyle.Secondary : ButtonStyle.Danger);
        if ( inputLabel != "" && inputLabel != " " && inputLabel != null && inputLabel != undefined ) { NewRoleButton.setLabel(inputLabel); }
        if ( inputEmoji != "" && inputEmoji != " " && inputEmoji != null && inputEmoji != undefined ) {
            if ( EmojiRegex.default().test(inputEmoji) ) { NewRoleButton.setEmoji({ name: inputEmoji }); }
            else {
                // It's a Discord Emoji. So App needs both the name and the ID
                inputEmoji = inputEmoji.replace('<', '');
                inputEmoji = inputEmoji.replace('>', '');
                let splitEmoji = inputEmoji.split(":");
                let emojiId = splitEmoji.pop();
                let emojiName = splitEmoji.pop();
                NewRoleButton.setEmoji({ id: emojiId, name: emojiName });
            }
        }

        
        // Add Button to Cache
        originalResponse.menuButtons.push(NewRoleButton);

        // Re-construct for editing into Menu Message
        let updatedComponents = [];
        let temp = new ActionRowBuilder();
        let textFieldOne = "";
        let textFieldTwo = "";

        originalResponse.menuEmbed.spliceFields(0, 3);

        originalResponse.menuButtons.forEach(roleButton => {
            if ( temp.components.length === 5 ) {
                updatedComponents.push(temp.toJSON());
                temp.setComponents([ roleButton ]);
            }
            else {
                temp.addComponents([ roleButton ]);
            }
            

            if ( textFieldOne.length <= 1000 ) {
                let tempId = roleButton.data.custom_id.split("_").pop();
                let tempLabel = roleButton.data.emoji != undefined && roleButton.data.emoji.id != undefined ? `<:${roleButton.data.emoji.name}:${roleButton.data.emoji.id}> ${roleButton.data.label != undefined ? roleButton.data.label : ''}`
                    : roleButton.data.emoji != undefined && roleButton.data.emoji.id == undefined ? `${roleButton.data.emoji.name} ${roleButton.data.label != undefined ? roleButton.data.label : ''}`
                    : roleButton.data.label;

                textFieldOne += `• <@&${tempId}> - ${tempLabel}\n`;
            }
            else {
                let tempId = roleButton.data.custom_id.split("_").pop();
                let tempLabel = roleButton.data.emoji != undefined && roleButton.data.emoji.id != undefined ? `<:${roleButton.data.emoji.name}:${roleButton.data.emoji.id}> ${roleButton.data.label != undefined ? roleButton.data.label : ''}`
                    : roleButton.data.emoji != undefined && roleButton.data.emoji.id == undefined ? `${roleButton.data.emoji.name} ${roleButton.data.label != undefined ? roleButton.data.label : ''}`
                    : roleButton.data.label;

                textFieldTwo += `• <@&${tempId}> - ${tempLabel}\n`;
            }

            // If last Button, push back into Array
            let checkIndex = originalResponse.menuButtons.findIndex(rButton => rButton.data.custom_id === `role_${roleButton.data.custom_id.split("_").pop()}`);
            if ( originalResponse.menuButtons.length - 1 === checkIndex ) {
                updatedComponents.push(temp.toJSON());
            }
        });

        // re-add Select Menu
        updatedComponents.push(originalResponse.selectMenu.toJSON());

        // Update Embed
        originalResponse.menuEmbed.addFields({ name: `\u200B`, value: textFieldOne });
        if ( textFieldTwo.length > 3 ) { originalResponse.menuEmbed.addFields({ name: `\u200B`, value: textFieldTwo }); }
        let embedJson = originalResponse.menuEmbed.toJSON();

        // Edit into main
        await fetch(OriginalInteractionResponseEndpoint(DISCORD_APP_USER_ID, originalResponse.interactionToken), {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bot ${DISCORD_TOKEN}`
            },
            body: JSON.stringify({
                embeds: [embedJson],
                components: updatedComponents
            })
        });


        // Save Cache
        UtilityCollections.RoleMenuManagement.set(UserId, originalResponse);

        // ACK
        return new JsonResponse({
            type: InteractionResponseType.UpdateMessage,
            data: {
                components: [],
                content: localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_SUCCESS')
            }
        });
    }
}
