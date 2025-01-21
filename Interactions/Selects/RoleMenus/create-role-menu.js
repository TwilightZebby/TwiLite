import { ComponentType, InteractionResponseType, MessageFlags, TextInputStyle } from 'discord-api-types/v10';
import { ActionRowBuilder, ModalBuilder, RoleSelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder } from '@discordjs/builders';
import { localize } from '../../../Utility/localizeResponses.js';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { CreateInteractionFollowupEndpoint, CreateInteractionResponseEndpoint, CreateMessageEndpoint, RoleMentionRegEx, UtilityCollections } from '../../../Utility/utilityConstants.js';
import { DISCORD_APP_USER_ID, DISCORD_TOKEN } from '../../../config.js';


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
        const UserId = interaction.member != undefined ? interaction.member?.user.id : interaction.user?.id;

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
                let currentComponents = interaction.message.components;
                currentComponents.pop(); // Delete last row from check, since that row is the Select Menu, not the Buttons!
                // Only perform check if there are actually buttons!
                if ( currentComponents.length !== 0 ) {
                    // Now count the buttons
                    let roleButtonCount = 0;
                    currentComponents.forEach(row => {
                        row.components.forEach(button => {
                            // Sanity check
                            if ( button.type === ComponentType.Button ) { roleButtonCount += 1; }
                        });
                    });

                    if ( roleButtonCount === 15 ) {
                        // ACK!
                        return new JsonResponse({
                            type: InteractionResponseType.ChannelMessageWithSource,
                            data: {
                                flags: MessageFlags.Ephemeral,
                                content: localize(interaction.locale, 'ROLE_MENU_ERROR_BUTTON_LIMIT_EXCEEDED')
                            }
                        });
                    }
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
                let currentRoles = interaction.message.components;
                currentRoles.pop(); // Delete last row from check, since that row is the Select Menu, not the Buttons!
                // If no Buttons, throw error
                if ( currentRoles.length === 0 ) {
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
                // TODO: Add check for Requirement Limit of 5
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
                // TODO: Add check that there are Requirements to remove
                // ACK to ask User which Requirement to remove
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        components: [removeRequirementJson],
                        content: localize(interaction.locale, 'ROLE_MENU_REQUIREMENT_REMOVE_INSTRUCTIONS')
                    }
                });


            // Save & Displays the newly created Role Menu
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
                        content: localize(interaction.locale, 'ROLE_MENU_CREATION_CANCELLED')
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
    // Grab Embed & Buttons, and Role Requirements (if any)
    const MenuEmbed = interaction.message.embeds.shift();
    let menuComponents = interaction.message.components;
    let menuMessageContent = interaction.message.content;
    let menuRequirements = Array.from(menuMessageContent.matchAll(RoleMentionRegEx), (m) => m[0]);

    // Remove Select Menu Component
    menuComponents.pop();

    // Create Requirements String, if any are present
    let requirementString = "";

    if ( menuRequirements.length === 1 ) {
        requirementString = localize(interaction.guild_locale, 'ROLE_MENU_RESTRICTION_SINGLE', `${menuRequirements[0]}`);
    }
    else if ( menuRequirements.length > 1 ) {
        requirementString = localize(interaction.guild_locale, 'ROLE_MENU_RESTRICTION_MULTIPLE', `${menuRequirements.join(" / ")}`);
    }


    // JSONify everything
    let componentJson = JSON.stringify(menuComponents);
    let embedJson = JSON.stringify(MenuEmbed);


    // Post Menu
    let postMenu = await fetch(CreateMessageEndpoint(interaction.channel.id), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot ${DISCORD_TOKEN}`
        },
        body: JSON.stringify({
            content: requirementString,
            embeds: [embedJson],
            components: componentJson,
            allowed_mentions: { parse: [] }
        })
    });


    // Now ACK Interaction
    return new JsonResponse({
        type: InteractionResponseType.UpdateMessage,
        data: {
            flags: MessageFlags.Ephemeral,
            components: [],
            embeds: [],
            content: localize(interaction.locale, 'ROLE_MENU_CREATION_SUCCESS', `PLACEHOLDER_URL`)
        }
    });
}
