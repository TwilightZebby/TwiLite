import { ComponentType, InteractionResponseType } from 'discord-api-types/v10';
import { hexToRgb, JsonResponse, rgbArrayToInteger } from '../../../Utility/utilityMethods.js';
import { HexColourRegex } from '../../../Utility/utilityConstants.js';


export const Modal = {
    /** The Modals's name - set as the START of the Modal's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "modalName_extraData"
     * @type {String}
     */
    name: "menu-set-details",

    /** Modal's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles changing a Role Menu's details",

    /** Runs the Modal
     * @param {import('discord-api-types/v10').APIModalSubmitGuildInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeModal(interaction, interactionUser) {
        // Grab inputted data
        const ModalComponents = interaction.data.components;
        let inputMenuTitle = "";
        let inputMenuDescription = "\u200B";
        let inputMenuSidebarColor = undefined;

        for ( let i = 0; i <= ModalComponents.length - 1; i++) {
            let tempTopLevelComp = ModalComponents[i].component;
            if ( tempTopLevelComp.custom_id === "menu-title" ) { inputMenuTitle = tempTopLevelComp.value; }
            if ( tempTopLevelComp.custom_id === "menu-description" ) { inputMenuDescription = tempTopLevelComp.value ?? "\u200B"; }
            if ( tempTopLevelComp.custom_id === "menu-color" ) { inputMenuSidebarColor = tempTopLevelComp.value ?? undefined; }
        }

        // Validate inputted colour
        if ( !HexColourRegex.test(inputMenuSidebarColor) ) {
            inputMenuSidebarColor = undefined;
        }

        // Convert the hex colour into a raw colour value for Discord's API to receive
        if ( inputMenuSidebarColor != undefined ) {
            inputMenuSidebarColor = rgbArrayToInteger(hexToRgb(inputMenuSidebarColor));
        }

        // Update message components
        let MessageComponents = interaction.message.components;
        /** @type {import('discord-api-types/v10').APIContainerComponent} */
        let MenuContainer = MessageComponents.find(comp => comp.type === ComponentType.Container);

        // Update Menu's sidebar colour
        MenuContainer.accent_color = inputMenuSidebarColor;
        MenuContainer.components.forEach(comp => {
            // Update Menu's Title
            if ( comp.id === 4 ) { comp.content = `## ${inputMenuTitle}`; }
            // Update Menu's Description
            if ( comp.id === 5 ) { comp.content = inputMenuDescription; }
        });

        // Put container back into message
        MessageComponents.forEach(comp => {
            if ( comp.type === ComponentType.Container ) { comp = MenuContainer; }
        });

        return new JsonResponse({
            type: InteractionResponseType.UpdateMessage,
            data: {
                components: MessageComponents
            }
        });
    }
}
