import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { localize } from '../../../Utility/localizeResponses.js';
import { HexColourRegex, UtilityCollections } from '../../../Utility/utilityConstants.js';
import { hexToRgb, JsonResponse } from '../../../Utility/utilityMethods.js';


export const Modal = {
    /** The Modals's name - set as the START of the Modal's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "modalName_extraData"
     * @type {String}
     */
    name: "menu-embed",

    /** Modal's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles input for Role Menu embed data",

    /** Runs the Modal
     * @param {import('discord-api-types/v10').APIModalSubmitGuildInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeModal(interaction, interactionUser) {
        // Grab inputs
        let inputTitle;
        let inputDescription;
        let inputColor;
        interaction.data.components.forEach(modalRow => {
            modalRow.components.forEach(modalComponent => {
                if ( modalComponent.custom_id === "title" ) { inputTitle = modalComponent.value; }
                else if ( modalComponent.custom_id === "description" ) { inputDescription = modalComponent.value; }
                else if ( modalComponent.custom_id === "hex-color" ) { inputColor = modalComponent.value; }
            });
        });

        const UserId = interaction.member != undefined ? interaction.member?.user.id : interaction.user?.id;
        let menuCache = UtilityCollections.RoleMenuManagement.get(UserId);

        // Set new Embed values
        if ( inputTitle != "" && inputTitle != " " && inputTitle != null && inputTitle != undefined ) { menuCache.menuEmbed.setTitle(inputTitle); }
        else { menuCache.menuEmbed.setTitle(null); }

        if ( inputDescription != "" && inputDescription != " " && inputDescription != null && inputDescription != undefined ) { menuCache.menuEmbed.setDescription(inputDescription); }
        else { menuCache.menuEmbed.setDescription(null); }

        if ( inputColor != "" && inputColor != " " && inputColor != null && inputColor != undefined ) {
            // Validate inputted colour
            if ( !HexColourRegex.test(inputColor) ) {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'ERROR_INVALID_COLOR_HEX')
                    }
                });
            }
            else { menuCache.menuEmbed.setColor(hexToRgb(inputColor)); }
        }
        else { menuCache.menuEmbed.setColor(null); }


        // Save back to cache
        UtilityCollections.RoleMenuManagement.set(UserId, menuCache);


        // ACK
        let updatedEmbedJson = menuCache.menuEmbed.toJSON();

        return new JsonResponse({
            type: InteractionResponseType.UpdateMessage,
            data: {
                embeds: [updatedEmbedJson]
            }
        });
    }
}
