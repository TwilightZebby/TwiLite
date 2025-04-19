import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { OriginalInteractionResponseEndpoint, UtilityCollections } from '../../../Utility/utilityConstants.js';
import { ActionRowBuilder } from '@discordjs/builders';
import { DISCORD_APP_USER_ID, DISCORD_TOKEN } from '../../../config.js';


export const Select = {
    /** The Select's name - set as the START of the Button's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "selectName_extraData"
     * @type {String}
     */
    name: "menu-remove-role",

    /** Select's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles removing a Role from Role Menus",

    /** Select's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 3,

    /** Runs the Select
     * @param {import('discord-api-types/v10').APIMessageComponentSelectMenuInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeSelect(interaction, interactionUser) {
        // Grab selected Role
        const InputRoleId = interaction.data.values.shift();

        // Validate selected Role *is* on Menu
        const UserId = interaction.member.user.id;
        let menuCache = UtilityCollections.RoleMenuManagement.get(UserId);
        let doesRoleExistOnMenu = false;

        for ( let i = 0; i < menuCache.menuButtons.length - 1; i++ ) {
            if ( menuCache.menuButtons[i].data.custom_id.includes(InputRoleId) ) {
                doesRoleExistOnMenu = true;
                let catchDeletion = menuCache.menuButtons.splice(i, 1);
                break;
            }
        }

        // If Role doesn't exist on Menu, return ACK
        if ( !doesRoleExistOnMenu ) {
            return new JsonResponse({
                type: InteractionResponseType.UpdateMessage,
                data: {
                    content: `${localize(interaction.locale, 'ROLE_MENU_ROLE_REMOVE_INSTRUCTIONS')}\n\n:warning: ${localize(interaction.locale, 'ROLE_MENU_ERROR_ROLE_NOT_ON_MENU', `<@&${InputRoleId}>`)}`
                }
            });
        }


        // Role *does* exist, so now remove from Embed & update component Arrays
        menuCache.menuEmbed.spliceFields(0, 3);
        let updatedComponents = [];
        let temp = new ActionRowBuilder();
        let textFieldOne = "";
        let textFieldTwo = "";

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

        // Re-add Select Menu
        updatedComponents.push(menuCache.selectMenu.toJSON());

        // Update Embed
        menuCache.menuEmbed.addFields({ name: `\u200B`, value: textFieldOne });
        if ( textFieldTwo.length > 3 ) { menuCache.menuEmbed.addFields({ name: `\u200B`, value: textFieldTwo }); }
        let embedJson = menuCache.menuEmbed.toJSON();


        // Update Menu
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


        // Save back to cache
        UtilityCollections.RoleMenuManagement.set(UserId, menuCache);

        
        // ACK
        return new JsonResponse({
            type: InteractionResponseType.UpdateMessage,
            data: {
                components: [],
                content: localize(interaction.locale, 'ROLE_MENU_REMOVE_ROLE_SUCCESS')
            }
        });
    }
}
