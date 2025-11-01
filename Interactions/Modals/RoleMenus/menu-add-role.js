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
            // Safety net to stop Text Displays breaking this check
            if ( ModalComponents[i].type === ComponentType.Label ) {
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
        /** @type {import('discord-api-types/v10').APIActionRowComponent<import('discord-api-types/v10').APIButtonComponentWithCustomId>[]} */
        let MenuButtons = MenuContainer.components.filter(componentItem => componentItem.type === ComponentType.ActionRow);
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

        // Validate Role isn't a "Managed" Role (which means no one can grant/revoke it)
        let resolvedSelectedRole = interaction.data.resolved.roles[inputSelectedRole];

        if ( resolvedSelectedRole.managed ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    "flags": MessageFlags.Ephemeral,
                    "content": localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_CANNOT_ADD_MANAGED_ROLES', `<@&${inputSelectedRole}>`)
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
        if ( MenuButtons.length === 0 ) {
            // This is the very first button on the Menu
            MenuButtons.push({
                "type": ComponentType.ActionRow,
                "id": 9,
                "components": [newMenuButton]
            });
        }
        else if ( MenuButtons.length === 1 && menuRoleIds.length < 5 ) {
            // First row has space
            MenuButtons[0].components.push(newMenuButton);
        }
        else if ( MenuButtons.length === 1 && menuRoleIds.length === 5 ) {
            // First row is full, but no second row created yet
            MenuButtons.push({
                "type": ComponentType.ActionRow,
                "components": [newMenuButton]
            });
        }
        else if ( MenuButtons.length === 2 && (menuRoleIds.length > 5 && menuRoleIds.length < 10) ) {
            // Second row has space
            MenuButtons[1].components.push(newMenuButton);
        }
        else if ( MenuButtons.length === 2 && menuRoleIds.length === 10 ) {
            // Second row is row, but no third row created yet
            MenuButtons.push({
                "type": ComponentType.ActionRow,
                "components": [newMenuButton]
            });
        }
        else {
            // Third/Final row has space
            MenuButtons[2].components.push(newMenuButton);
        }

        // Recreate Role List to add newly added assignable Role
        let roleList = [];
        MenuButtons.forEach(row => {
            row.components.forEach(button => {
                let tempRoleId = button.custom_id.split("_").pop();
                let tempLabel = button.label;
                roleList.push(`- <@&${tempRoleId}> - ${tempLabel}`);
            });
        });


        // Edit into Menu
        for ( let i = 0; i <= MenuButtons.length - 1; i++ ) {
            // This mess is just so I can pull each updated row out of MenuButtons and into MenuContainer.components, without having an Array where a Component Object should be
            MenuContainer.components.splice(5 + i, 1, MenuButtons[i]);
        }
        
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
                "components": MessageComponents,
                "allowed_mentions": { "parse": [] }
            }
        });
    }
}
