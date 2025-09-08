import { ButtonStyle, ComponentType, InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { RoleMentionRegEx } from '../../../Utility/utilityConstants.js';
import { localize } from '../../../Utility/localizeResponses.js';


export const Modal = {
    /** The Modals's name - set as the START of the Modal's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "modalName_extraData"
     * @type {String}
     */
    name: "menu-add-role",

    /** Modal's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles adding a new Role to a Menu",

    /** Runs the Modal
     * @param {import('discord-api-types/v10').APIModalSubmitGuildInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeModal(interaction, interactionUser) {
        // Grab inputted data
        const ModalComponents = interaction.data.components;
        let inputSelectedRole = "";
        let inputButtonLabel = "";
        let inputButtonColor = ButtonStyle.Secondary;

        for ( let i = 0; i <= ModalComponents.length - 1; i++) {
            let tempTopLevelComp = ModalComponents[i].component;
            // Selected Role
            if ( tempTopLevelComp.custom_id === "role-to-add" ) {
                inputSelectedRole = tempTopLevelComp.values.shift();
            }
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



        // Validate selected Role *isn't* already on the Menu as an assignable Role or as a Menu Requirement
        let MessageComponents = interaction.message.components;
        /** @type {import('discord-api-types/v10').APIContainerComponent} */
        let MenuContainer = MessageComponents.find(comp => comp.type === ComponentType.Container);
        
        // Grab Requirements
        let MenuRequirementComponent = MenuContainer.components.find(comp => comp.id === 7);
        /** @type {Array<String>} */
        let MenuRequirements = Array.from(MenuRequirementComponent.content.matchAll(RoleMentionRegEx), (m) => m[0]);

        // Grab already added assignable Roles
        let MenuButtons = MenuContainer.filter(componentItem => componentItem.type === ComponentType.ActionRow);
        let menuRoleIds = [];
        MenuButtons.forEach(row => {
            row.components.forEach(button => {
                menuRoleIds.push(button.custom_id.split("_").pop());
            });
        });

        // Validation against Requirements
        if ( MenuRequirements.includes(inputSelectedRole) ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    "flags": MessageFlags.Ephemeral,
                    "content": localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_ALREADY_ADDED_AS_REQUIREMENT', `<@&${inputSelectedRole}>`)
                }
            });
        }
        // Validation against assignable Roles
        if ( menuRoleIds.includes(inputSelectedRole) ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    "flags": MessageFlags.Ephemeral,
                    "content": localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_ALREADY_ADDED_AS_ASSIGNABLE', `<@&${inputSelectedRole}>`)
                }
            });
        }



        // Validated Role isn't already on the Menu - so add it as an assignable Role!
        // Create the new Button
        /** @type {import('discord-api-types/v10').APIButtonComponentWithCustomId} */
        let newMenuButton = {
            "type": ComponentType.Button,
            "custom_id": `role_${inputSelectedRole}`,
            "label": `${inputButtonLabel}`,
            "style": inputButtonColor
        };

        // Add to Menu (use already added number of assignable Roles to know which Row to add to)
        if ( menuRoleIds.length < 5 ) {
            // First row has space
            MenuButtons[0].components.push(newMenuButton);
        }
        else if ( menuRoleIds.length >= 5 && menuRoleIds.length < 10 ) {
            // Second row has space
            MenuButtons[1].components.push(newMenuButton);
        }
        else {
            // Third/Final row has space
            MenuButtons[2].components.push(newMenuButton);
        }


        // Edit into Menu
        MenuContainer.components.splice(4, MenuButtons.length, MenuButtons);

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
