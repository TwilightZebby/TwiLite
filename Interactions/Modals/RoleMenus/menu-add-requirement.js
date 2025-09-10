import { ComponentType, InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { RoleMentionRegEx } from '../../../Utility/utilityConstants.js';
import { localize } from '../../../Utility/localizeResponses.js';


export const Modal = {
    /** The Modals's name - set as the START of the Modal's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "modalName_extraData"
     * @type {String}
     */
    name: "menu-add-requirement",

    /** Modal's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles adding a new Requirement to a Menu",

    /** Runs the Modal
     * @param {import('discord-api-types/v10').APIModalSubmitGuildInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeModal(interaction, interactionUser) {
        // Grab inputted data
        const ModalComponents = interaction.data.components;
        let inputSelectedRole = "";

        for ( let i = 0; i <= ModalComponents.length - 1; i++) {
            // Safety net to stop Text Displays breaking this check
            if ( ModalComponents[i].type === ComponentType.Label ) {
                let tempTopLevelComp = ModalComponents[i].component;
                // Selected Role
                if ( tempTopLevelComp.custom_id === "role-to-add" ) {
                    inputSelectedRole = tempTopLevelComp.values.shift();
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
                    "content": localize(interaction.locale, 'ROLE_MENU_ADD_REQUIREMENTS_ALREADY_ADDED_AS_REQUIREMENT', `<@&${inputSelectedRole}>`)
                }
            });
        }
        // Validation against assignable Roles
        if ( menuRoleIds.includes(inputSelectedRole) ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    "flags": MessageFlags.Ephemeral,
                    "content": localize(interaction.locale, 'ROLE_MENU_ADD_REQUIREMENTS_ALREADY_ADDED_AS_ASSIGNABLE', `<@&${inputSelectedRole}>`)
                }
            });
        }



        // Validated Role isn't already on the Menu - so add it as a new Requirement!
        MenuRequirements.push(inputSelectedRole);

        // Format into string
        let requirementsString = ``;
        if ( MenuRequirements.length === 0 ) {
            requirementsString = localize(interaction.guild_locale, 'ROLE_MENU_RESTRICTION_NONE');
        }
        else if ( MenuRequirements.length === 1 ) {
            requirementsString = localize(interaction.guild_locale, 'ROLE_MENU_RESTRICTION_SINGLE', MenuRequirements[0].startsWith("<@&") ? MenuRequirements[0] : `<@&${MenuRequirements[0]}>`);
        }
        else {
            let tempRequirements = MenuRequirements.map(item => item.startsWith("<@&") ? item : `<@&${item}>`).join(', ');
            requirementsString = localize(interaction.guild_locale, 'ROLE_MENU_RESTRICTION_MULTIPLE', `${tempRequirements}`);
        }
        

        // Edit into Menu
        MenuContainer.components.forEach(comp => {
            if ( comp.id === 7 ) { comp.content = requirementsString; }
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
