import { ComponentType, InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { RoleMentionRegEx } from '../../../Utility/utilityConstants.js';
import { localize } from '../../../Utility/localizeResponses.js';


export const Modal = {
    /** The Modals's name - set as the START of the Modal's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "modalName_extraData"
     * @type {String}
     */
    name: "menu-remove-requirement",

    /** Modal's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles removing an existing Requirement from a Menu",

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
                if ( tempTopLevelComp.custom_id === "role-to-remove" ) {
                    inputSelectedRole = tempTopLevelComp.values.shift();
                }
            }
        }


        // Grab message components
        let MessageComponents = interaction.message.components;
        /** @type {import('discord-api-types/v10').APIContainerComponent} */
        let MenuContainer = MessageComponents.find(comp => comp.type === ComponentType.Container);

        // Grab Requirements
        let MenuRequirementComponent = MenuContainer.components.find(comp => comp.id === 7);
        /** @type {Array<String>} */
        let MenuRequirements = Array.from(MenuRequirementComponent.content.matchAll(RoleMentionRegEx), (m) => m[0]);


        // Validate selected Role *is* an added Requirement that can be removed
        if ( !(MenuRequirements.includes(`<@&${inputSelectedRole}>`)) ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'ROLE_MENU_REMOVE_REQUIREMENT_SELECTED_ROLE_NOT_ON_MENU', `<@&${inputSelectedRole}>`)
                }
            });
        }

        // Remove selected Requirement
        let selectedIndex = MenuRequirements.findIndex(item => item === inputSelectedRole);
        let catchDeletion = MenuRequirements.splice(selectedIndex, 1);


        // Update requirements string
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
                "components": MessageComponents,
                "allowed_mentions": { "parse": [] }
            }
        });
    }
}
