import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import * as EmojiRegex from 'emoji-regex';
import { ActionRowBuilder } from '@discordjs/builders';
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
    name: "menu-edit-button",

    /** Modal's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles editing Role Buttons on Role Menus",

    /** Runs the Modal
     * @param {import('discord-api-types/v10').APIModalSubmitGuildInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeModal(interaction, interactionUser) {
        // Grab inputs
        const SplitCustomId = interaction.data.custom_id.split("_");
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
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'ROLE_MENU_ERROR_CANNOT_HAVE_BLANK_BUTTON')
                }
            });
        }


        // Validate Emoji, if one was given
        if ( inputEmoji != "" && inputEmoji != " " && inputEmoji != null && inputEmoji != undefined ) {
            if ( !DiscordEmojiRegex.test(inputEmoji) && !EmojiRegex.default().test(inputEmoji) ) {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'ROLE_MENU_ERROR_INVALID_EMOJI', `<${EMOJIPEDIA_URI}>`)
                    }
                });
            }
        }


        // Update Button in cache
        const UserId = interaction.member.user.id;
        let menuCache = UtilityCollections.RoleMenuManagement.get(UserId);

        for ( let i = 0; i <= menuCache.menuButtons.length - 1; i++ ) {
            if ( menuCache.menuButtons[i].data.custom_id.includes(RoleId) ) {
                if ( inputLabel != "" && inputLabel != " " && inputLabel != null && inputLabel != undefined ) { menuCache.menuButtons[i].setLabel(inputLabel); }
                else { menuCache.menuButtons[i].data.label = undefined; }

                if ( inputEmoji != "" && inputEmoji != " " && inputEmoji != null && inputEmoji != undefined ) {
                    if ( EmojiRegex.default().test(inputEmoji) ) { menuCache.menuButtons[i].setEmoji({ name: inputEmoji }); }
                    else {
                        // It's a Discord Emoji. So App needs both the name and the ID
                        inputEmoji = inputEmoji.replace('<', '');
                        inputEmoji = inputEmoji.replace('>', '');
                        let splitEmoji = inputEmoji.split(":");
                        let emojiId = splitEmoji.pop();
                        let emojiName = splitEmoji.pop();
                        menuCache.menuButtons[i].setEmoji({ id: emojiId, name: emojiName });
                    }
                }
                else { menuCache.menuButtons[i].data.emoji = undefined; }

                break;
            }
        }



        // Re-construct for editing into Menu Message
        let updatedComponents = [];
        let temp = new ActionRowBuilder();
        let textFieldOne = "";
        let textFieldTwo = "";
        
        menuCache.menuEmbed.spliceFields(0, 3);
        
        menuCache.menuButtons.forEach(roleButton => {
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
            let checkIndex = menuCache.menuButtons.findIndex(rButton => rButton.data.custom_id === `role_${roleButton.data.custom_id.split("_").pop()}`);
            if ( menuCache.menuButtons.length - 1 === checkIndex ) {
                updatedComponents.push(temp.toJSON());
            }
        });
        
        // re-add Select Menu
        updatedComponents.push(menuCache.selectMenu.toJSON());
        
        // Update Embed
        menuCache.menuEmbed.addFields({ name: `\u200B`, value: textFieldOne });
        if ( textFieldTwo.length > 3 ) { menuCache.menuEmbed.addFields({ name: `\u200B`, value: textFieldTwo }); }
        let embedJson = menuCache.menuEmbed.toJSON();

        // Edit into main
        await fetch(OriginalInteractionResponseEndpoint(DISCORD_APP_USER_ID, menuCache.interactionToken), {
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
        UtilityCollections.RoleMenuManagement.set(UserId, menuCache);

        // ACK
        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.Ephemeral,
                content: localize(interaction.locale, 'ROLE_MENU_EDIT_BUTTON_SUCCESS')
            }
        });
    }
}
