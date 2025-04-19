import { InteractionResponseType } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { OriginalInteractionResponseEndpoint, UtilityCollections } from '../../../Utility/utilityConstants.js';
import { DISCORD_APP_USER_ID, DISCORD_TOKEN } from '../../../config.js';


export const Select = {
    /** The Select's name - set as the START of the Button's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "selectName_extraData"
     * @type {String}
     */
    name: "menu-remove-requirement",

    /** Select's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles removing existing Requirements from Role Menus",

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

        // Validate Role is added as a Requirement
        const UserId = interaction.member.user.id;
        let menuCache = UtilityCollections.RoleMenuManagement.get(UserId);

        if ( !menuCache.roleRequirements.includes(InputRoleId) ) {
            return new JsonResponse({
                type: InteractionResponseType.UpdateMessage,
                data: {
                    content: `${localize(interaction.locale, 'ROLE_MENU_REQUIREMENT_REMOVE_INSTRUCTIONS')}\n\n:warning ${localize(interaction.locale, 'ROLE_MENU_ERROR_REQUIREMENT_ROLE_NOT_ON_MENU', `<@&${InputRoleId}>`)}`
                }
            });
        }


        // Remove Requirement
        //menuCache.roleRequirements.push(InputRoleId);
        for ( let i = 0; i <= menuCache.roleRequirements.length - 1; i++ ) {
            if ( menuCache.roleRequirements[i] === InputRoleId ) {
                let catchDeletion = menuCache.roleRequirements.splice(i, 1);
                break;
            }
        }

        let updatedRequirements = `\n\n`;

        if ( menuCache.roleRequirements.length === 1 ) {
            updatedRequirements += localize(interaction.guild_locale, 'ROLE_MENU_RESTRICTION_SINGLE', `<@&${menuCache.roleRequirements[0]}>`);
        }
        else if ( menuCache.roleRequirements.length > 1 ) {
            updatedRequirements += localize(interaction.guild_locale, 'ROLE_MENU_RESTRICTION_MULTIPLE', `<@&${menuCache.roleRequirements.join("> / <@&")}>`);
        }


        // Edit into main
        await fetch(OriginalInteractionResponseEndpoint(DISCORD_APP_USER_ID, menuCache.interactionToken), {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bot ${DISCORD_TOKEN}`
            },
            body: JSON.stringify({
                content: `${menuCache.mainInstructions}${updatedRequirements}`
            })
        });

        // Save cache
        UtilityCollections.RoleMenuManagement.set(UserId, menuCache);

        // ACK
        return new JsonResponse({
            type: InteractionResponseType.UpdateMessage,
            data: {
                components: [],
                content: localize(interaction.locale, 'ROLE_MENU_REMOVE_REQUIREMENT_SUCCESS')
            }
        });
    }
}
