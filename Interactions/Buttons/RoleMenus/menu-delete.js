import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
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
        // Grab data
        let buttonCustomId = interaction.data.custom_id.split("_");
        const DeletionConfirmation = interaction.data.custom_id.includes("cancel") ? "CANCEL" : "CONFIRM";

        if ( DeletionConfirmation === "CANCEL" ) {
            return new JsonResponse({
                type: InteractionResponseType.UpdateMessage,
                data: {
                    content: localize(interaction.locale, 'DELETE_ROLE_MENU_COMMAND_CANCELLED'),
                    components: []
                }
            });
        }
        else {
            const MenuMessageId = buttonCustomId.pop();

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
                        content: localize(interaction.locale, 'DELETE_ROLE_MENU_COMMAND_SUCCESS'),
                        components: []
                    }
                });
            }
            else {
                return new JsonResponse({
                    type: InteractionResponseType.UpdateMessage,
                    data: {
                        content: localize(interaction.locale, 'DELETE_ROLE_MENU_COMMAND_ERROR_GENERIC'),
                        components: []
                    }
                });
            }
        }
    }
}
