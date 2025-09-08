import { ButtonStyle, ComponentType, InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { RoleMentionRegEx } from '../../../Utility/utilityConstants.js';
import { localize } from '../../../Utility/localizeResponses.js';


export const Modal = {
    /** The Modals's name - set as the START of the Modal's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "modalName_extraData"
     * @type {String}
     */
    name: "menu-remove-role",

    /** Modal's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles removing an existing assignable Role from a Menu",

    /** Runs the Modal
     * @param {import('discord-api-types/v10').APIModalSubmitGuildInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeModal(interaction, interactionUser) {
        // Grab inputted data
        const ModalComponents = interaction.data.components;
        let inputSelectedRole = "";

        for ( let i = 0; i <= ModalComponents.length - 1; i++) {
            let tempTopLevelComp = ModalComponents[i].component;
            // Selected Role
            if ( tempTopLevelComp.custom_id === "role-to-add" ) {
                inputSelectedRole = tempTopLevelComp.values.shift();
            }
        }



        // Grab message components
        let MessageComponents = interaction.message.components;
        /** @type {import('discord-api-types/v10').APIContainerComponent} */
        let MenuContainer = MessageComponents.find(comp => comp.type === ComponentType.Container);

        // Grab already added assignable Roles
        /** @type {import('discord-api-types/v10').APIActionRowComponent<import('discord-api-types/v10').APIButtonComponentWithCustomId>[]} */
        let MenuButtons = MenuContainer.filter(componentItem => componentItem.type === ComponentType.ActionRow);

        // Splice specified Role out of Menu
        let hasBeenRemoved = false;
        for ( let i = 0; i <= MenuButtons.length - 1; i++ ) {
            for ( let j = 0; j <= MenuButtons[i].components.length - 1; j++ ) {
                if ( MenuButtons[i].components[j].custom_id.includes(inputSelectedRole) ) {
                    let catchDeletion = MenuButtons[i].components.splice(j, 1);
                    hasBeenRemoved = true;
                    break;
                }
            }
            if ( hasBeenRemoved ) { break; }
        }



        // Completely recreate MenuButtons in order to make sure there's no random gaps in the rows after the removal
        /** @type {import('discord-api-types/v10').APIActionRowComponent<import('discord-api-types/v10').APIButtonComponentWithCustomId>[]} */
        let updatedMenuButtons = [];
        let menuRoleIds = [];
        MenuButtons.forEach(row => {
            row.components.forEach(button => {
                menuRoleIds.push(button.custom_id.split("_").pop());
            });
        });

        MenuButtons.forEach(row => {
            row.components.forEach(button => {

                if ( updatedMenuButtons.length === 0 ) {
                    // This is the very first button on the Menu
                    updatedMenuButtons.push({
                        "type": ComponentType.ActionRow,
                        "id": 8,
                        "components": [button]
                    });
                }
                else if ( updatedMenuButtons.length === 1 && menuRoleIds.length < 5 ) {
                    // First row has space
                    updatedMenuButtons[0].components.push(button);
                }
                else if ( updatedMenuButtons.length === 1 && menuRoleIds.length === 5 ) {
                    // First row is full, but no second row created yet
                    updatedMenuButtons.push({
                        "type": ComponentType.ActionRow,
                        "components": [button]
                    });
                }
                else if ( updatedMenuButtons.length === 2 && (menuRoleIds.length > 5 && menuRoleIds.length < 10) ) {
                    // Second row has space
                    updatedMenuButtons[1].components.push(button);
                }
                else if ( updatedMenuButtons.length === 2 && menuRoleIds.length === 10 ) {
                    // Second row is row, but no third row created yet
                    updatedMenuButtons.push({
                        "type": ComponentType.ActionRow,
                        "components": [button]
                    });
                }
                else {
                    // Third/Final row has space
                    updatedMenuButtons[2].components.push(button);
                }

            });
        });


        // Recreate Role List to remove the recently removed Role
        let roleList = [];
        updatedMenuButtons.forEach(row => {
            row.components.forEach(button => {
                let tempRoleId = button.custom_id.split("_").pop();
                let tempLabel = button.label;
                roleList.push(`- <@&${tempRoleId}> - ${tempLabel}`);
            });
        });


        // Edit into Menu
        MenuContainer.components.splice(4, MenuButtons.length, updatedMenuButtons);
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
                components: MessageComponents,
                "allowed_mentions": { "parse": [] }
            }
        });
    }
}
