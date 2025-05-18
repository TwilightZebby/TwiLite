import { ComponentType, InteractionResponseType, MessageFlags, TextInputStyle } from 'discord-api-types/v10';
import { ActionRowBuilder, ModalBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder } from '@discordjs/builders';
import { localize } from '../../../Utility/localizeResponses.js';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { ManageMessageEndpoint, RoleMentionRegEx, UtilityCollections } from '../../../Utility/utilityConstants.js';
import { DISCORD_TOKEN } from '../../../config.js';


export const Select = {
    /** The Select's name - set as the START of the Button's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "selectName_extraData"
     * @type {String}
     */
    name: "configure-role-menu",

    /** Select's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles processing options during configurion of Role Menus",

    /** Select's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 3,

    /** Runs the Select
     * @param {import('discord-api-types/v10').APIMessageComponentSelectMenuInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeSelect(interaction, interactionUser) {
        // Construct needed Selects
        const AddRoleSelect = new ActionRowBuilder().addComponents([
            new RoleSelectMenuBuilder().setCustomId(`menu-add-role`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(interaction.locale, 'ROLE_MENU_ROLE_ADD_SEARCH'))
        ]);

        const RemoveRoleSelect = new ActionRowBuilder().addComponents([
            new RoleSelectMenuBuilder().setCustomId(`menu-remove-role`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(interaction.locale, 'ROLE_MENU_ROLE_REMOVE_SEARCH'))
        ]);

        const SetMenuTypeSelect = new ActionRowBuilder().addComponents([
            new StringSelectMenuBuilder().setCustomId(`menu-set-type`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(interaction.locale, 'ROLE_MENU_SELECT_MENU_TYPE')).setOptions([
                new StringSelectMenuOptionBuilder().setValue(`TOGGLE`).setLabel(localize(interaction.locale, 'ROLE_MENU_MENU_TYPE_TOGGLE')),
                new StringSelectMenuOptionBuilder().setValue(`SWAP`).setLabel(localize(interaction.locale, 'ROLE_MENU_MENU_TYPE_SWAPPABLE')),
                new StringSelectMenuOptionBuilder().setValue(`SINGLE`).setLabel(localize(interaction.locale, 'ROLE_MENU_MENU_TYPE_SINGLE'))
            ])
        ]);

        const AddRequirementsSelect = new ActionRowBuilder().setComponents([
            new RoleSelectMenuBuilder().setCustomId(`menu-add-requirement`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(interaction.locale, 'ROLE_MENU_REQUIREMENT_ADD_SEARCH'))
        ]);

        const RemoveRequirementsSelect = new ActionRowBuilder().setComponents([
            new RoleSelectMenuBuilder().setCustomId(`menu-remove-requirement`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(interaction.locale, 'ROLE_MENU_REQUIREMENT_REMOVE_SEARCH'))
        ]);

        // JSONify all the above for when ACKing responses!
        let addRoleJson = AddRoleSelect.toJSON();
        let removeRoleJson = RemoveRoleSelect.toJSON();
        let setMenuTypeJson = SetMenuTypeSelect.toJSON();
        let addRequirementJson = AddRequirementsSelect.toJSON();
        let removeRequirementJson = RemoveRequirementsSelect.toJSON();


        // Grab selected value & User ID
        const InputOption = interaction.data.values.shift();
        const UserId = interaction.member.user.id;

        switch (InputOption) {
            // Set Menu Type
            case "set-type":
                // Ask User what Menu Type they want
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        components: [setMenuTypeJson],
                        content: localize(interaction.locale, 'ROLE_MENU_SET_MENU_TYPE_INSTRUCTIONS')
                    }
                });


            // Manage Embed
            case "configure-embed":
                // Grab current Embed info to use in Modal
                let currentEmbed = interaction.message.embeds.shift();

                let embedModal = new ModalBuilder().setCustomId(`menu-embed`).setTitle(localize(interaction.locale, 'ROLE_MENU_CONFIGURE_MENU_EMBED')).addComponents([
                    new ActionRowBuilder().addComponents([ new TextInputBuilder().setCustomId(`title`).setLabel(localize(interaction.locale, 'ROLE_MENU_EMBED_TITLE')).setMaxLength(256).setStyle(TextInputStyle.Short).setRequired(true).setValue(!currentEmbed.title ? "" : currentEmbed.title) ]),
                    new ActionRowBuilder().addComponents([ new TextInputBuilder().setCustomId(`description`).setLabel(localize(interaction.locale, 'ROLE_MENU_EMBED_DESCRIPTION')).setMaxLength(2000).setStyle(TextInputStyle.Paragraph).setRequired(false).setValue(!currentEmbed.description ? "" : currentEmbed.description) ]),
                    new ActionRowBuilder().addComponents([ new TextInputBuilder().setCustomId(`hex-color`).setLabel(localize(interaction.locale, 'ROLE_MENU_EMBED_COLOR')).setMaxLength(7).setStyle(TextInputStyle.Short).setPlaceholder("#ab44ff").setRequired(false).setValue(!currentEmbed.color ? "" : `${typeof currentEmbed.color === 'number' ? `#${currentEmbed.color.toString(16).padStart(6, '0')}` : currentEmbed.color}`) ])
                ]);

                let embedModalJson = embedModal.toJSON();

                return new JsonResponse({
                    type: InteractionResponseType.Modal,
                    data: embedModalJson
                });

            
            // Add a Role to the Menu
            case "add-role":
                // **** Validate Menu doesn't already have max limit of 15 Roles added
                let currentAddedRoles = UtilityCollections.RoleMenuManagement.get(UserId);
                if ( currentAddedRoles.menuButtons.length === 15 ) {
                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: localize(interaction.locale, 'ROLE_MENU_ERROR_BUTTON_LIMIT_EXCEEDED')
                        }
                    });
                }

                // There is still space for more Roles, so ask which should be added
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        components: [addRoleJson],
                        content: localize(interaction.locale, 'ROLE_MENU_ROLE_ADD_INSTRUCTIONS')
                    }
                });


            // Remove a Role from the Menu
            case "remove-role":
                // **** Validate Menu does have Roles Added
                let currentRoles = UtilityCollections.RoleMenuManagement.get(UserId);
                if ( currentRoles.menuButtons.length === 0 ) {
                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: localize(interaction.locale, 'ROLE_MENU_ERROR_NO_ROLES_ON_MENU')
                        }
                    });
                }

                // ACK to ask User which Role to remove from Menu
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        components: [removeRoleJson],
                        content: localize(interaction.locale, 'ROLE_MENU_ROLE_REMOVE_INSTRUCTIONS')
                    }
                });


            // Add a Requirement to use the Menu
            case "add-requirement":
                // Check Menu hasn't reached max of 5 requirements
                let currentAddedRequirements = UtilityCollections.RoleMenuManagement.get(UserId);
                if ( currentAddedRequirements.roleRequirements.length === 5 ) {
                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: localize(interaction.locale, 'ROLE_MENU_ERROR_REQUIREMENT_MAX_REACHED')
                        }
                    });
                }

                // ACK to ask User which Role to add as a Requirement
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        components: [addRequirementJson],
                        content: localize(interaction.locale, 'ROLE_MENU_REQUIREMENT_ADD_INSTRUCTIONS')
                    }
                });


            // Remove a Requirement
            case "remove-requirement":
                // Check Menu actually has Requirements on it
                let currentRequirements = UtilityCollections.RoleMenuManagement.get(UserId);
                if ( currentRequirements.roleRequirements.length === 0 ) {
                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: localize(interaction.locale, 'ROLE_MENU_ERROR_NO_REQUIREMENTS_FOUND')
                        }
                    });
                }

                // ACK to ask User which Requirement to remove
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        components: [removeRequirementJson],
                        content: localize(interaction.locale, 'ROLE_MENU_REQUIREMENT_REMOVE_INSTRUCTIONS')
                    }
                });


            // Save & Displays the edited Role Menu
            case "save":
                return await saveAndDisplay(interaction);


            // Cancels creation of Role menu
            case "cancel":
            default:
                // Purge cache, just in case
                UtilityCollections.RoleMenuManagement.delete(UserId);
                // ACK
                return new JsonResponse({
                    type: InteractionResponseType.UpdateMessage,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        components: [],
                        embeds: [],
                        content: localize(interaction.locale, 'ROLE_MENU_CONFIGURATION_CANCELLED')
                    }
                });
        }
    }
}







/**
 * Saves & displays the edited Role Menu for Members to use
 * @param {import('discord-api-types/v10').APIMessageComponentSelectMenuInteraction} interaction
 */
async function saveAndDisplay(interaction) {
    // Grab Embed & Buttons, and Role Requirements (if any)
    const MenuEmbed = interaction.message.embeds.shift();
    let menuComponents = interaction.message.components;
    let menuMessageContent = interaction.message.content;
    let menuRequirements = Array.from(menuMessageContent.matchAll(RoleMentionRegEx), (m) => m[0]);

    const UserId = interaction.member.user.id;
    const MenuCache = UtilityCollections.RoleMenuManagement.get(UserId);

    // Remove Select Menu Component
    menuComponents.pop();

    
    // Validate Role Menu *does* have needed elements (ie: Embed Title, Menu Type, and at least one Role)
    if ( MenuEmbed.footer == undefined || MenuEmbed.title == undefined || menuComponents.length === 0 ) {
        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.Ephemeral,
                content: localize(interaction.locale, 'ROLE_MENU_ERROR_MISSING_NEEDED_ELEMENTS')
            }
        });
    }


    // Create Requirements String, if any are present
    let requirementString = "";

    if ( menuRequirements.length === 1 ) {
        requirementString = localize(interaction.guild_locale, 'ROLE_MENU_RESTRICTION_SINGLE', `${menuRequirements[0]}`);
    }
    else if ( menuRequirements.length > 1 ) {
        requirementString = localize(interaction.guild_locale, 'ROLE_MENU_RESTRICTION_MULTIPLE', `${menuRequirements.join(" / ")}`);
    }


    // Convert Embed into using Components v2, for displaying Menu in :)
    //    NOTE: I'm not converting the Preview shown during editing yet as I figure that would be easier to do via a web dashboard in future

    // Menu Details
    let menuDetailsComponents = [
        // Menu Title
        {
            "id": 2,
            "type": ComponentType.TextDisplay,
            "content": `## ${MenuCache.menuEmbed.data.title}`
        }
    ];
    // Menu Description
    if ( MenuCache.menuEmbed.data.description != undefined ) {
        menuDetailsComponents.push({ "id": 3, "type": ComponentType.TextDisplay, "content": MenuCache.menuEmbed.data.description });
    }
    // Menu Role List
    let menuRoleList = "";
    menuRoleList += MenuCache.menuEmbed.data.fields.shift().value;
    if ( MenuCache.menuEmbed.data.fields?.length > 0 ) { menuRoleList += `\n${MenuCache.menuEmbed.data.fields.shift().value}`; }
    menuDetailsComponents.push({ "id": 4, "type": ComponentType.TextDisplay, "content": menuRoleList });
    // Menu Requirements
    if ( menuRequirements.length > 0 ) {
        menuDetailsComponents.push({ "id": 5, "type": ComponentType.TextDisplay, "content": `-# ${requirementString}` });
    }
    // Menu Type
    menuDetailsComponents.push({ "id": 6, "type": ComponentType.TextDisplay, "content": `-# ${MenuCache.menuEmbed.data.footer?.text}` });
    
    // Redo Buttons into Rows so that Discord's API won't give me a 400 response :S
    let temp = new ActionRowBuilder();

    MenuCache.menuButtons.forEach(rButton => {
        if ( temp.components.length === 5 ) {
            menuDetailsComponents.push(temp.toJSON());
            temp.setComponents([ rButton ]);
        }
        else {
            temp.addComponents([ rButton ]);
        }

        // If last Button, force-push back into Array
        let checkIndex = MenuCache.menuButtons.findIndex(theButton => theButton.data.custom_id === `role_${rButton.data.custom_id.split("_").pop()}`);
        if ( MenuCache.menuButtons.length - 1 === checkIndex ) {
            menuDetailsComponents.push(temp.toJSON());
        }
    });
        
    
    let convertToComponents = {
        "id": 1,
        "type": ComponentType.Container,
        "accent_color": MenuCache.menuEmbed.data.color != undefined ? MenuCache.menuEmbed.data.color : null,
        "spoiler": false,
        "components": menuDetailsComponents
    };


    // Post Menu
    let editMenuFetch = await fetch(ManageMessageEndpoint(interaction.channel.id, MenuCache.sourceMessageId), {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot ${DISCORD_TOKEN}`
        },
        body: JSON.stringify({
            flags: MessageFlags.IsComponentsV2,
            components: [convertToComponents],
            allowed_mentions: { parse: [] }
        })
    });


    // Now ACK Interaction
    return new JsonResponse({
        type: InteractionResponseType.UpdateMessage,
        data: {
            components: [],
            embeds: [],
            content: localize(interaction.locale, 'ROLE_MENU_CONFIGURATION_SUCCESS')
        }
    });
}
