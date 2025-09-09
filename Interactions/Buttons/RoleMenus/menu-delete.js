import { ComponentType, InteractionResponseType } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { ManageMessageEndpoint } from '../../../Utility/utilityConstants.js';
import { DISCORD_TOKEN } from '../../../config.js';


export const Button = {
    /** The Button's name - set as the START of the Button's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "buttonName_extraData"
     * @type {String}
     */
    name: "menu-delete",

    /** Button's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles confirmation for Role Menu deletions",

    /** Button's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 10,

    /** Runs the Button
     * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeButton(interaction, interactionUser) {
        // Validate confirmation
        if ( interaction.data.custom_id.includes("cancel") ) {
            return new JsonResponse({
                type: InteractionResponseType.UpdateMessage,
                data: {
                    components: [{
                        "type": ComponentType.TextDisplay,
                        "content": localize(interaction.locale, 'DELETE_ROLE_MENU_COMMAND_CANCELLED')
                    }]
                }
            });
        }
        else {
            // Confirmation confirmed. Delete menu!
            const MenuMessageId = interaction.data.custom_id.split("_").pop();

            let attemptDeletion = await fetch(ManageMessageEndpoint(interaction.channel.id, MenuMessageId), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bot ${DISCORD_TOKEN}`
                }
            });

            if ( attemptDeletion.status === 204 ) {
                return new JsonResponse({
                    type: InteractionResponseType.UpdateMessage,
                    data: {
                        components: [{
                            "type": ComponentType.TextDisplay,
                            "content": localize(interaction.locale, 'DELETE_ROLE_MENU_COMMAND_SUCCESS')
                        }]
                    }
                });
            }
            else {
                return new JsonResponse({
                    type: InteractionResponseType.UpdateMessage,
                    data: {
                        components: [{
                            "type": ComponentType.TextDisplay,
                            "content": localize(interaction.locale, 'DELETE_ROLE_MENU_COMMAND_ERROR_GENERIC')
                        }]
                    }
                });
            }
        }
    }
}
