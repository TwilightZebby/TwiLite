import { ComponentType, InteractionResponseType, MessageFlags, SelectMenuDefaultValueType, TextInputStyle } from 'discord-api-types/v10';
import { ActionRowBuilder, ModalBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder } from '@discordjs/builders';
import { localize } from '../../../Utility/localizeResponses.js';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { CreateMessageEndpoint, RoleMentionRegEx, UtilityCollections } from '../../../Utility/utilityConstants.js';
import { DISCORD_TOKEN } from '../../../config.js';
import { IMAGE_TWILITE_ROLEMENU_CONTEXT_COMMANDS } from '../../../Assets/Hyperlinks.js';


export const Select = {
    /** The Select's name - set as the START of the Button's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "selectName_extraData"
     * @type {String}
     */
    name: "create-role-menu",

    /** Select's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles processing options during creation of Role Menus",

    /** Select's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 3,

    /** Runs the Select
     * @param {import('discord-api-types/v10').APIMessageComponentSelectMenuInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeSelect(interaction, interactionUser) {
        // **** Construct needed Modals
        /**
         * For grabbing which Role should be added to the Menu
         */
        let AddRoleModal = {
            "custom_id": `menu-add-role`,
            "title": localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_MODAL_TITLE'),
            "components": [{
                // Ask for which Role to add
                "type": ComponentType.Label,
                "label": localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_MODAL_ROLE_SELECT_LABEL'),
                "description": localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_MODAL_ROLE_SELECT_DESCRIPTION'),
                "component": {
                    "type": ComponentType.RoleSelect,
                    "custom_id": `role-to-add`,
                    "placeholder": localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_MODAL_ROLE_SELECT_PLACEHOLDER'),
                    "min_values": 1,
                    "max_values": 1,
                    "required": true
                }
            }, {
                // Ask for label to display on Button
                "type": ComponentType.Label,
                "label": localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_MODAL_BUTTON_LABEL_INPUT_LABEL'),
                "description": localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_MODAL_BUTTON_LABEL_INPUT_DESCRIPTION'),
                "component": {
                    "type": ComponentType.TextInput,
                    "custom_id": `button-label`,
                    "style": TextInputStyle.Short,
                    "max_length": 80,
                    "required": true
                }
            }, {
                // Ask for which colour to display the Button in
                "type": ComponentType.Label,
                "label": localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_MODAL_BUTTON_COLOR_LABEL'),
                "description": localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_MODAL_BUTTON_COLOR_DESCRIPTION'),
                "component": {
                    "type": ComponentType.StringSelect,
                    "custom_id": `button-color`,
                    "min_values": 1,
                    "max_values": 1,
                    "required": true,
                    "placeholder": localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_MODAL_BUTTON_COLOR_SELECT_PLACEHOLDER'),
                    "options": [{
                        "label": localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_MODAL_BUTTON_COLOR_OPTION_BLURPLE'),
                        "value": `BLURPLE`
                    }, {
                        "label": localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_MODAL_BUTTON_COLOR_OPTION_GREEN'),
                        "value": `GREEN`
                    }, {
                        "label": localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_MODAL_BUTTON_COLOR_OPTION_GREY'),
                        "value": `GREY`
                    }, {
                        "label": localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_MODAL_BUTTON_COLOR_OPTION_RED'),
                        "value": `RED`
                    }]
                }
            }]
        };

        /**
         * For grabbing which Role should be removed from the Menu
         */
        let RemoveRoleModal = {
            "custom_id": `menu-remove-role`,
            "title": localize(interaction.locale, 'ROLE_MENU_REMOVE_ROLE_MODAL_TITLE'),
            "components": [{
                // Ask for which Role to remove
                "type": ComponentType.Label,
                "label": localize(interaction.locale, 'ROLE_MENU_REMOVE_ROLE_MODAL_LABEL'),
                "description": localize(interaction.locale, 'ROLE_MENU_REMOVE_ROLE_MODAL_DESCRIPTION'),
                "component": {
                    "type": ComponentType.RoleSelect,
                    "custom_id": `role-to-remove`,
                    "placeholder": localize(interaction.locale, 'ROLE_MENU_REMOVE_ROLE_MODAL_PLACEHOLDER'),
                    "min_values": 1,
                    "max_values": 1,
                    "default_values": [],
                    "required": true
                }
            }]
        };

        /**
         * For grabbing the Menu Type
         */
        let SetMenuTypeModal = {
            "custom_id": `menu-set-type`,
            "title": localize(interaction.locale, 'ROLE_MENU_SET_MENU_TYPE_MODAL_TITLE'),
            "components": [{
                // Text Display for explaining the different menu types
                "type": ComponentType.TextDisplay,
                "content": localize(interaction.locale, 'ROLE_MENU_SET_MENU_TYPE_MODAL_TYPES_EXPLAINATION')
            }, {
                // Ask for the menu type to set
                "type": ComponentType.Label,
                "label": localize(interaction.locale, 'ROLE_MENU_SET_MENU_TYPE_MODAL_SELECT_LABEL'),
                "component": {
                    "type": ComponentType.StringSelect,
                    "custom_id": `menu-type`,
                    "min_values": 1,
                    "max_values": 1,
                    "required": true,
                    "placeholder": localize(interaction.locale, 'ROLE_MENU_SET_MENU_TYPE_MODAL_SELECT_PLACEHOLDER'),
                    "options": [{
                        "label": localize(interaction.locale, 'ROLE_MENU_SET_MENU_TYPE_MODAL_SELECT_OPTION_TOGGLE'),
                        "value": `TOGGLE`
                    }, {
                        "label": localize(interaction.locale, 'ROLE_MENU_SET_MENU_TYPE_MODAL_SELECT_OPTION_SWAP'),
                        "value": `SWAP`
                    }, {
                        "label": localize(interaction.locale, 'ROLE_MENU_SET_MENU_TYPE_MODAL_SELECT_OPTION_SINGLE_USE'),
                        "value": `SINGLE`
                    }]
                }
            }]
        };

        /**
         * For changing the Menu's details (title, description, sidebar colour)
         */
        let SetMenuDetailsModal = {
            "custom_id": `menu-set-details`,
            "title": localize(interaction.locale, 'ROLE_MENU_SET_MENU_DETAILS_MODAL_TITLE'),
            "components": [{
                // Ask for Menu's title
                "type": ComponentType.Label,
                "label": localize(interaction.locale, 'ROLE_MENU_SET_MENU_DETAILS_MODAL_MENU_TITLE_LABEL'),
                "description": localize(interaction.locale, 'ROLE_MENU_SET_MENU_DETAILS_MODAL_MENU_TITLE_DESCRIPTION'),
                "component": {
                    "type": ComponentType.TextInput,
                    "custom_id": `menu-title`,
                    "style": TextInputStyle.Short,
                    "max_length": 256,
                    "required": true,
                    "value": undefined
                }
            }, {
                // Ask for Menu's description
                "type": ComponentType.Label,
                "label": localize(interaction.locale, 'ROLE_MENU_SET_MENU_DETAILS_MODAL_MENU_DESCRIPTION_LABEL'),
                "description": localize(interaction.locale, 'ROLE_MENU_SET_MENU_DETAILS_MODAL_MENU_DESCRIPTION_LABEL_DESCRIPTION'),
                "component": {
                    "type": ComponentType.TextInput,
                    "custom_id": `menu-description`,
                    "style": TextInputStyle.Paragraph,
                    "max_length": 2000,
                    "required": false,
                    "value": undefined
                }
            }, {
                // Ask for Menu's sidebar colour
                "type": ComponentType.Label,
                "label": localize(interaction.locale, 'ROLE_MENU_SET_MENU_DETAILS_MODAL_MENU_COLOR_LABEL'),
                "description": localize(interaction.locale, 'ROLE_MENU_SET_MENU_DETAILS_MODAL_MENU_COLOR_DESCRIPTION'),
                "component": {
                    "type": ComponentType.TextInput,
                    "custom_id": `menu-color`,
                    "style": TextInputStyle.Short,
                    "max_length": 7,
                    "required": false,
                    "placeholder": "#ab44ff",
                    "value": undefined
                }
            }]
        };

        /**
         * For adding a new requirement
         */
        let AddRequirementModal = {
            "custom_id": `menu-add-requirement`,
            "title": localize(interaction.locale, 'ROLE_MENU_ADD_REQUIREMENT_MODAL_TITLE'),
            "components": [{
                // Ask for the Role to add as a requirement
                "type": ComponentType.Label,
                "label": localize(interaction.locale, 'ROLE_MENU_ADD_REQUIREMENT_MODAL_LABEL'),
                "description": localize(interaction.locale, 'ROLE_MENU_ADD_REQUIREMENT_MODAL_DESCRIPTION'),
                "component": {
                    "type": ComponentType.RoleSelect,
                    "custom_id": `role-to-add`,
                    "min_values": 1,
                    "max_values": 1,
                    "required": true,
                    "placeholder": localize(interaction.locale, 'ROLE_MENU_ADD_REQUIREMENT_MODAL_PLACEHOLDER')
                }
            }]
        };

        /**
         * For removing a requirement
         */
        let RemoveRequirementModal = {
            "custom_id": `menu-remove-requirement`,
            "title": localize(interaction.locale, 'ROLE_MENU_REMOVE_REQUIREMENT_MODAL_TITLE'),
            "components": [{
                // Ask for the Role requirement to remove
                "type": ComponentType.Label,
                "label": localize(interaction.locale, 'ROLE_MENU_REMOVE_REQUIREMENT_MODAL_LABEL'),
                "description": localize(interaction.locale, 'ROLE_MENU_REMOVE_REQUIREMENT_MODAL_DESCRIPTION'),
                "component": {
                    "type": ComponentType.RoleSelect,
                    "custom_id": `role-to-remove`,
                    "min_values": 1,
                    "max_values": 1,
                    "required": true,
                    "placeholder": localize(interaction.locale, 'ROLE_MENU_REMOVE_REQUIREMENT_MODAL_PLACEHOLDER'),
                    "default_values": []
                }
            }]
        };

        
        
        // Grab selected option & interaction user ID & current components
        const InputOption = interaction.data.values.shift();
        const CurrentComponents = interaction.message.components;
        const CurrentContainer = CurrentComponents.find(comp => comp.type === ComponentType.Container);


        // Act based on selected option
        switch (InputOption) {
            // Set Menu Type
            case "set-type":
                return new JsonResponse({
                    type: InteractionResponseType.Modal,
                    data: SetMenuTypeModal
                });

            
            // Manage Menu Details
            case "edit-details":
                // Grab current details in order to pre-fill the Modal (for better UX)
                let currentMenuTitle = CurrentContainer.components.find(comp => comp.id === 4);
                let currentMenuDescription = CurrentContainer.components.find(comp => comp.id === 5);
                let currentMenuSidebarColor = CurrentContainer.accent_color;

                // Set Title field
                SetMenuDetailsModal.components[0].component.value = currentMenuTitle.content.slice(3) ?? undefined;
                // Set Description field
                SetMenuDetailsModal.components[1].component.value = currentMenuDescription.content ?? undefined;
                // Set Sidebar Colour field
                SetMenuDetailsModal.components[2].component.value = !currentMenuSidebarColor ? undefined : `${typeof currentMenuSidebarColor === 'number' ? `#${currentMenuSidebarColor.toString(16).padStart(6, '0')}` : currentMenuSidebarColor}`;
                
                return new JsonResponse({
                    type: InteractionResponseType.Modal,
                    data: SetMenuDetailsModal
                });


            // Add a Role
            case "add-role":
                // Validate max roles per menu limit (of 15) hasn't been reached
                let currentMenuActionRows = CurrentContainer.components.filter(comp => comp.type === ComponentType.ActionRow);
                let countAddedRoles = 0;
                currentMenuActionRows.forEach(row => {
                    row.components.forEach(button => {
                        countAddedRoles += 1;
                    });
                });

                if ( countAddedRoles === 15 ) {
                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: { "flags": MessageFlags.Ephemeral, "content": localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_MAX_BUTTONS_LIMIT_REACHED') }
                    });
                }

                return new JsonResponse({
                    type: InteractionResponseType.Modal,
                    data: AddRoleModal
                });


            // Remove a Role
            case "remove-role":
                // Validate there are Roles on the Menu
                let currentAddedActionRows = CurrentContainer.components.filter(comp => comp.type === ComponentType.ActionRow);
                let countExistingRoles = 0;
                // Also grab Role IDs so we can pre-populate the Role Select
                /** @type {import('discord-api-types/v10').APISelectMenuDefaultValue[]} */
                let defaultRoleValues = [];

                currentAddedActionRows.forEach(row => {
                    row.components.forEach(button => {
                        countExistingRoles += 1;
                        let roleIdTemp = button.custom_id.split("_").pop();
                        defaultRoleValues.push({ id: roleIdTemp, type: SelectMenuDefaultValueType.Role });
                    });
                });

                if ( countExistingRoles === 0 ) {
                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: { "flags": MessageFlags.Ephemeral, "content": localize(interaction.locale, 'ROLE_MENU_REMOVE_ROLE_NO_ROLES_ADDED') }
                    });
                }

                // Set default values in Role Select
                RemoveRoleModal.components[0].component.default_values = defaultRoleValues;

                return new JsonResponse({
                    type: InteractionResponseType.Modal,
                    data: RemoveRoleModal
                });


            // Add a Requirement
            case "add-requirement":
                // Validate max requirements per menu limit (of 5) hasn't been reached
                let currentMenuRequirements = CurrentContainer.components.find(comp => comp.id === 7);
                let matchedRequirements = Array.from(currentMenuRequirements.content.matchAll(RoleMentionRegEx), (m) => m[0]);

                if ( matchedRequirements.length === 5 ) {
                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: { "flags": MessageFlags.Ephemeral, "content": localize(interaction.locale, 'ROLE_MENU_ADD_REQUIREMENTS_LIMIT_REACHED') }
                    });
                }

                return new JsonResponse({
                    type: InteractionResponseType.Modal,
                    data: AddRequirementModal
                });

            
            // Remove a Requirement
            case "remove-requirement":
                // Validate there are set requirements to remove
                let addedMenuRequirements = CurrentContainer.components.find(comp => comp.id === 7);
                let existingRequirements = Array.from(addedMenuRequirements.content.matchAll(RoleMentionRegEx), (m) => m[0]);
                // Also grab Role IDs so we can pre-populate the Role Select
                /** @type {import('discord-api-types/v10').APISelectMenuDefaultValue[]} */
                let defaultRequirementValues = [];

                if ( existingRequirements.length === 0 ) {
                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: { "flags": MessageFlags.Ephemeral, "content": localize(interaction.locale, 'ROLE_MENU_REMOVE_REQUIREMENT_NONE_ADDED') }
                    });
                }

                // Set default values for Role Select
                existingRequirements.forEach(item => {
                    defaultRequirementValues.push({ id: item, type: SelectMenuDefaultValueType.Role });
                });
                RemoveRequirementModal.components[0].component.default_values = defaultRequirementValues;

                return new JsonResponse({
                    type: InteractionResponseType.Modal,
                    data: RemoveRequirementModal
                });


            // Save & post the newly created Role Menu
            case "save":
                return await saveAndDisplay(interaction);


            // Cancels creation
            case "cancel":
                return new JsonResponse({
                    type: InteractionResponseType.UpdateMessage,
                    data: {
                        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
                        components: [{ "type": ComponentType.TextDisplay, "content": localize(interaction.locale, 'ROLE_MENU_CREATION_CANCELLED') }]
                    }
                });
        }
    }
}







/**
 * Saves & displays the new Role Menu for Members to use
 * @param {import('discord-api-types/v10').APIMessageComponentSelectMenuInteraction} interaction
 */
async function saveAndDisplay(interaction) {
    // Grab components to repost Role Menu
    const MessageComponents = interaction.message.components;
    const MenuContainer = MessageComponents.find(comp => comp.type === ComponentType.Container);


    // Post Menu
    let attemptMenuPost = await fetch(CreateMessageEndpoint(interaction.channel.id), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot ${DISCORD_TOKEN}`
        },
        body: JSON.stringify({
            flags: MessageFlags.IsComponentsV2,
            components: [MenuContainer],
            allowed_mentions: { parse: [] }
        })
    });

    if ( attemptMenuPost.status != 204 && attemptMenuPost.status != 200 ) {
        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                "flags": MessageFlags.Ephemeral,
                "content": localize(interaction.locale, 'ROLE_MENU_CREATION_ERROR_GENERIC')
            }
        });
    }


    // Now ACK Interaction
    return new JsonResponse({
        type: InteractionResponseType.UpdateMessage,
        data: {
            /** @type {import('discord-api-types/v10').APIMessageTopLevelComponent[]} */
            components: [{
                "type": ComponentType.TextDisplay,
                "content": localize(interaction.locale, 'ROLE_MENU_CREATION_SUCCESS')
            }, {
                "type": ComponentType.MediaGallery,
                "items": [{ "media": { "url": IMAGE_TWILITE_ROLEMENU_CONTEXT_COMMANDS }, "description": localize(interaction.locale, 'ROLE_MENU_CREATION_SUCCESS_IMAGE_ALT_TEXT') }]
            }]
        }
    });
}
