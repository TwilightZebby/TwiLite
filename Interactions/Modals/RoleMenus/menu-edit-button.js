import { ButtonStyle, ComponentType, InteractionResponseType } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';


export const Modal = {
    /** The Modals's name - set as the START of the Modal's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "modalName_extraData"
     * @type {String}
     */
    name: "menu-edit-button",

    /** Modal's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles editing an existing Role Button on a Menu",

    /** Runs the Modal
     * @param {import('discord-api-types/v10').APIModalSubmitGuildInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeModal(interaction, interactionUser) {
        // Grab inputted data
        const ModalComponents = interaction.data.components;
        let inputSelectedRole = interaction.data.custom_id.split("_").pop();
        let inputButtonLabel = "";
        let inputButtonColor = ButtonStyle.Secondary;

        for ( let i = 0; i <= ModalComponents.length - 1; i++) {
            let tempTopLevelComp = ModalComponents[i].component;
            // Button Label
            if ( tempTopLevelComp.custom_id === "button-label" ) {
                inputButtonLabel = tempTopLevelComp.value;
            }
            // Button Colour
            if ( tempTopLevelComp.custom_id === "button-color" ) {
                let tempColor = tempTopLevelComp.values.shift();
                inputButtonColor = tempColor === "BLURPLE" ? ButtonStyle.Primary
                    : tempColor === "GREEN" ? ButtonStyle.Success
                    : tempColor === "GREY" ? ButtonStyle.Secondary
                    : ButtonStyle.Danger;
            }
        }



        // Grab message components
        let MessageComponents = interaction.message.components;
        /** @type {import('discord-api-types/v10').APIContainerComponent} */
        let MenuContainer = MessageComponents.find(comp => comp.type === ComponentType.Container);
        
        // Grab already added assignable Roles
        /** @type {import('discord-api-types/v10').APIActionRowComponent<import('discord-api-types/v10').APIButtonComponentWithCustomId>[]} */
        let MenuButtons = MenuContainer.filter(componentItem => componentItem.type === ComponentType.ActionRow);

        // Edit the button using new details
        let hasButtonBeenEdited = false;
        for ( let i = 0; i <= MenuButtons.length - 1; i++ ) {
            for ( let j = 0; j <= MenuButtons[i].components.length - 1; j++ ) {
                if ( MenuButtons[i].components[j].custom_id.includes(inputSelectedRole) ) {
                    MenuButtons[i].components[j].label = inputButtonLabel;
                    MenuButtons[i].components[j].style = inputButtonColor;
                    hasButtonBeenEdited = true;
                }

                if ( hasButtonBeenEdited ) { break; }
            }

            if ( hasButtonBeenEdited ) { break; }
        }

        // Recreate Role List to update the edited Button's label with the list
        let roleList = [];
        MenuButtons.forEach(row => {
            row.components.forEach(button => {
                let tempRoleId = button.custom_id.split("_").pop();
                let tempLabel = button.label;
                roleList.push(`- <@&${tempRoleId}> - ${tempLabel}`);
            });
        });

        // Edit into Menu
        MenuContainer.components.splice(4, MenuButtons.length, MenuButtons);
        MenuContainer.components.forEach(comp => {
            if ( comp.id === 6 ) { comp.content = roleList.join(`\n`); }
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
