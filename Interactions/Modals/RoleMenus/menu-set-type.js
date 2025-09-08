import { ComponentType, InteractionResponseType } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';


export const Modal = {
    /** The Modals's name - set as the START of the Modal's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "modalName_extraData"
     * @type {String}
     */
    name: "menu-set-type",

    /** Modal's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles changing the Role Menu's type",

    /** Runs the Modal
     * @param {import('discord-api-types/v10').APIModalSubmitGuildInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeModal(interaction, interactionUser) {
        // Grab inputted data
        const ModalComponents = interaction.data.components;
        let inputMenuType = localize('en-GB', 'ROLE_MENU_TYPE_TOGGLE');
        
        for ( let i = 0; i <= ModalComponents.length - 1; i++) {
            let tempTopLevelComp = ModalComponents[i].component;
            if ( tempTopLevelComp.custom_id === "menu-type" ) {
                let tempType = tempTopLevelComp.values.shift();
                inputMenuType = tempType === 'TOGGLE' ? 'Toggle' : tempType === 'SWAP' ? 'Swappable' : 'Single-use';
            }
        }

        // Update message components
        let MessageComponents = interaction.message.components;
        /** @type {import('discord-api-types/v10').APIContainerComponent} */
        let MenuContainer = MessageComponents.find(comp => comp.type === ComponentType.Container);

        MenuContainer.components.forEach(comp => {
            // Update Menu's type
            if ( comp.id === 30 ) { comp.content = `${localize('en-GB', 'ROLE_MENU_TYPE_FOOTER', inputMenuType)}`; }
        });

        // Put container back into message
        MessageComponents.forEach(comp => {
            if ( comp.type === ComponentType.Container ) { comp = MenuContainer; }
        });

        // Update message
        return new JsonResponse({
            type: InteractionResponseType.UpdateMessage,
            data: {
                components: MessageComponents
            }
        });
    }
}
