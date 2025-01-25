import { InteractionResponseType, TextInputStyle } from 'discord-api-types/v10';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from '@discordjs/builders';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';


export const Select = {
    /** The Select's name - set as the START of the Button's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "selectName_extraData"
     * @type {String}
     */
    name: "menu-add-button",

    /** Select's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles selecting the colour of the new Role Button for Role Menus",

    /** Select's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 3,

    /** Runs the Select
     * @param {import('discord-api-types/v10').APIMessageComponentSelectMenuInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeSelect(interaction, interactionUser) {
        // Grab inputs
        const RoleId = interaction.data.custom_id.split("_").pop();
        const InputButtonType = interaction.data.values.shift();

        // Create Modal for grabbing Button Label/Emoji
        const MenuButtonModal = new ModalBuilder().setCustomId(`menu-button-text_${RoleId}_${InputButtonType}`).setTitle(localize(interaction.locale, 'ROLE_MENU_SET_BUTTON_LABEL')).setComponents([
            new ActionRowBuilder().addComponents([ new TextInputBuilder().setCustomId("label").setLabel(localize(interaction.locale, 'ROLE_MENU_BUTTON_LABEL')).setMaxLength(80).setStyle(TextInputStyle.Short).setRequired(false) ]),
            new ActionRowBuilder().addComponents([ new TextInputBuilder().setCustomId("emoji").setLabel(localize(interaction.locale, 'ROLE_MENU_BUTTON_EMOJI')).setMaxLength(200).setPlaceholder("<:grass_block:601353406577246208>, ✨").setStyle(TextInputStyle.Short).setRequired(false) ])
        ]);
        let menuButtonModalJson = MenuButtonModal.toJSON();

        return new JsonResponse({
            type: InteractionResponseType.Modal,
            data: menuButtonModalJson
        });
    }
}
