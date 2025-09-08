import { ButtonStyle, ComponentType, InteractionResponseType, MessageFlags, PermissionFlagsBits, TextInputStyle } from 'discord-api-types/v10';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from '@discordjs/builders';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { DISCORD_TOKEN } from '../../../config.js';
import { UtilityCollections } from '../../../Utility/utilityConstants.js';

// RegEx
const RoleMentionRegEx = new RegExp(/<@&(\d{17,20})>/g);


// ENDPOINTS
/** Endpoint for GRANTING/REVOKING a single Role for a Guild Member.
 * @method PUT for granting a Role
 * @method DELETE for revoking a Role
 */
const GuildMemberRoleEndpoint = (guildId, userId, roleId) => `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`;


export const Button = {
    /** The Button's name - set as the START of the Button's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "buttonName_extraData"
     * @type {String}
     */
    name: "role",

    /** Button's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles granting/revoking Roles via Role Menus",

    /** Button's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 5,

    /** Runs the Button
     * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeButton(interaction, interactionUser) {
        if ( (interaction.message.flags & MessageFlags.Ephemeral) == MessageFlags.Ephemeral ) {
            // Button was pressed during Menu Management, thus trigger editing process
            return await editRoleButton(interaction);
        }
        else {
            // Button was pressed outside Menu Management, thus trigger Role grant/revoke process
            return await grantRevokeRole(interaction);
        }
    }
}





/**
 * Handles granting/revoking Roles (when Button is pressed outside of Menu Management)
 * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction 
 */
async function grantRevokeRole(interaction) {
    // Make sure App has MANAGE_ROLES Perm :)
    let appPerms = BigInt(interaction.app_permissions);
    let hasManageRoles = (appPerms & PermissionFlagsBits.ManageRoles) == PermissionFlagsBits.ManageRoles;
    if ( hasManageRoles === false ) {
        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.Ephemeral,
                content: localize(interaction.locale, 'ROLE_MENU_ERROR_MISSING_MANAGE_ROLES_PERMISSION')
            }
        });
    }


    // Check for menu requirements
    const SourceMessage = interaction.message;
    const SourceComponents = SourceMessage.components;
    let findMenuType = SourceComponents[0].components.find(component => component.id === 30);
    const SourceMenuType = findMenuType != undefined ? findMenuType.content.split(": ").pop() : undefined;
    let menuRequirementComponent = SourceComponents[0].components.find(component => component.id === 7);

    /** @type {Array<String>} */
    let menuRequirements = Array.from(menuRequirementComponent.content.matchAll(RoleMentionRegEx), (m) => m[0]);

    if ( menuRequirements.length > 0 ) {
        // First, check for "Admin" Perm or Owner status, since those will bypass Menu Requirements
        let memberPerms = BigInt(interaction.member?.permissions);
        if ( !((memberPerms & PermissionFlagsBits.Administrator) == PermissionFlagsBits.Administrator) ) {
            // Since User doesn't bypass, check against requirements
            let meetsRequirements = false;
            menuRequirements.forEach(roleId => {
                if ( interaction.member?.roles.includes(roleId) ) {
                    // DOES meet requirements!
                    meetsRequirements = true;
                }
            });

            if ( !meetsRequirements ) {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'ROLE_BUTTON_ERROR_REQUIREMENTS_NOT_MET')
                    }
                });
            }
        }
    }


    // Fetch Role ID
    const RoleID = interaction.data.custom_id.split("_").pop();

    switch (SourceMenuType) {
        // Classic Role Menu. Grants Role if User doesn't have it, revokes Role if User does have it.
        case "Toggle":
            return await toggleRole(interaction, RoleID);


        // Swappable Role Menu. Users can only have ONE Role at a time per SWAPPABLE Menu. Example use case: Colour Roles.
        case "Swappable":
            return await swapRole(interaction, RoleID);
            

        // Single-use Role Menu. Users can only use a SINGLE-USE Menu once, and cannot remove the Role they get nor swap it. Example use case: Team Roles for events.
        case "Single-use":
            return await singleRole(interaction, RoleID);


        default:
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'BUTTON_ERROR_GENERIC')
                }
            });
    }
}





/**
 * Handles editing the Role Button (when Button is pressed during Menu Management)
 * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction 
 */
async function editRoleButton(interaction) {
    // Grab Role ID & button details for use in pre-filling the Modal
    const RoleId = interaction.data.custom_id.split("_").pop();
    const MessageComponents = interaction.message.components;
    const MenuCoontainer = MessageComponents.find(comp => comp.type === ComponentType.Container);
    const MenuActionRows = MenuCoontainer.components.filter(comp => comp.type === ComponentType.ActionRow);
    let currentButtonLabel = undefined;
    let currentButtonStyle = ButtonStyle.Secondary; // Grey by default

    for ( let i = 0; i <= MenuActionRows.length - 1; i++ ) {
        for ( let j = 0; j <= MenuActionRows[i].components.length - 1; j++ ) {
            if ( MenuActionRows[i].components[j].custom_id.includes(RoleId) ) {
                currentButtonLabel = MenuActionRows[i].components[j].label;
                currentButtonStyle = MenuActionRows[i].components[j].style;
                break;
            }
        }
        
        if ( currentButtonLabel != undefined ) { break; }
    }
    


    // Construct & display Modal for editing Button
    /**
     * For allowing the User to edit the selected Button on the Menu
     */
    let EditButtonModal = {
        "custom_id": `menu-edit-button_${RoleId}`,
        "title": localize(interaction.locale, ''),
        "components": [{
            // Text Display to let User know which Role they're editing the Button for
            "type": ComponentType.TextDisplay,
            "content": localize(interaction.locale, 'ROLE_MENU_EDIT_BUTTON_MODAL_DESCRIPTION', `<@&${RoleId}>`)
        }, {
            // Edit Button's Label
            "type": ComponentType.Label,
            "label": localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_MODAL_BUTTON_LABEL_INPUT_LABEL'),
            "description": localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_MODAL_BUTTON_LABEL_INPUT_DESCRIPTION'),
            "component": {
                "type": ComponentType.TextInput,
                "custom_id": `button-label`,
                "style": TextInputStyle.Short,
                "max_length": 80,
                "required": true,
                "value": currentButtonLabel
            }
        }, {
            // Edit Button's Colour
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
                    "value": `BLURPLE`,
                    "default": currentButtonStyle === ButtonStyle.Primary ? true : false
                }, {
                    "label": localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_MODAL_BUTTON_COLOR_OPTION_GREEN'),
                    "value": `GREEN`,
                    "default": currentButtonStyle === ButtonStyle.Success ? true : false
                }, {
                    "label": localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_MODAL_BUTTON_COLOR_OPTION_GREY'),
                    "value": `GREY`,
                    "default": currentButtonStyle === ButtonStyle.Secondary ? true : false
                }, {
                    "label": localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_MODAL_BUTTON_COLOR_OPTION_RED'),
                    "value": `RED`,
                    "default": currentButtonStyle === ButtonStyle.Danger ? true : false
                }]
            }
        }]
    };

    return new JsonResponse({
        type: InteractionResponseType.Modal,
        data: EditButtonModal
    });
}





/**
 * Handles Role Button Interactions from TOGGLE Menu Types
 * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction 
 * @param {String} RoleID
 */
async function toggleRole(interaction, RoleID) {
    // Check if Member already has Role
    if ( interaction.member.roles.includes(RoleID) ) {
        // Member already has Role, so REVOKE
        try {
            let revokeRoleRequest = await fetch(GuildMemberRoleEndpoint(interaction.guild_id, interaction.member.user.id, RoleID), {
                headers: {
                    'content-type': 'application/json',
                    Authorization: `Bot ${DISCORD_TOKEN}`,
                    'X-Audit-Log-Reason': localize(interaction.guild_locale, 'ROLE_BUTTON_AUDIT_LOG_ENTRY', `#${interaction.channel.name}`)
                },
                method: 'DELETE'
            });
            
            if ( revokeRoleRequest.status === 204 ) {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'ROLE_BUTTON_REVOKE_SUCCESS', `<@&${RoleID}>`)
                    }
                });
            }
            else {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'ROLE_BUTTON_ERROR_REVOKE_FAILED', `<@&${RoleID}>`)
                    }
                });
            }
        }
        catch (err) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'ROLE_BUTTON_ERROR_REVOKE_FAILED', `<@&${RoleID}>`)
                }
            });
        }
    }
    else {
        // Member does not have Role, so GRANT
        try {
            let grantRoleRequest = await fetch(GuildMemberRoleEndpoint(interaction.guild_id, interaction.member.user.id, RoleID), {
                headers: {
                    'content-type': 'application/json',
                    Authorization: `Bot ${DISCORD_TOKEN}`,
                    'X-Audit-Log-Reason': localize(interaction.guild_locale, 'ROLE_BUTTON_AUDIT_LOG_ENTRY', `#${interaction.channel.name}`)
                },
                method: 'PUT'
            });
            
            if ( grantRoleRequest.status === 204 ) {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'ROLE_BUTTON_GRANT_SUCCESS', `<@&${RoleID}>`)
                    }
                });
            }
            else {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'ROLE_BUTTON_ERROR_GRANT_FAILED', `<@&${RoleID}>`)
                    }
                });
            }
        }
        catch (err) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'ROLE_BUTTON_ERROR_GRANT_FAILED', `<@&${RoleID}>`)
                }
            });
        }
    }
}






/**
 * Handles Role Button Interactions from SWAP Menu Types
 * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction 
 * @param {String} RoleID
 */
async function swapRole(interaction, RoleID) {
    // Grab all the Roles on the Menu, to check if the Member already has any of them
    const MenuComponents = interaction.message.components;
    const MenuContainer = MenuComponents.find(comp => comp.type === ComponentType.Container);
    const MenuButtons = MenuContainer.components.filter(componentItem => componentItem.type === ComponentType.ActionRow);
    let menuRoleIds = [];
    MenuButtons.forEach(row => {
        row.components.forEach(button => {
            menuRoleIds.push(button.custom_id.split("_").pop());
        });
    });

    let memberHasRole = false;
    let roleAlreadyHave = null;
    menuRoleIds.forEach(idToCheck => {
        if ( interaction.member.roles.includes(idToCheck) ) {
            memberHasRole = true;
            roleAlreadyHave = idToCheck;
            return;
        }
    });


    // Member does NOT have any Roles from this Menu, so GRANT requested Role
    if ( !memberHasRole ) {
        try {
            let grantRoleRequest = await fetch(GuildMemberRoleEndpoint(interaction.guild_id, interaction.member.user.id, RoleID), {
                headers: {
                    'content-type': 'application/json',
                    Authorization: `Bot ${DISCORD_TOKEN}`,
                    'X-Audit-Log-Reason': localize(interaction.guild_locale, 'ROLE_BUTTON_AUDIT_LOG_ENTRY', `#${interaction.channel.name}`)
                },
                method: 'PUT'
            });
            
            if ( grantRoleRequest.status === 204 ) {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'ROLE_BUTTON_GRANT_SUCCESS', `<@&${RoleID}>`)
                    }
                });
            }
            else {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'ROLE_BUTTON_ERROR_GRANT_FAILED', `<@&${RoleID}>`)
                    }
                });
            }
        }
        catch (err) {
            console.log(err);
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'ROLE_BUTTON_ERROR_GRANT_FAILED', `<@&${RoleID}>`)
                }
            });
        }
    }
    // Member DOES have a Role from this Menu already
    else {
        // If Member already has requested Role, revoke it
        if ( interaction.member.roles.includes(RoleID) ) {
            try {
                let revokeRoleRequest = await fetch(GuildMemberRoleEndpoint(interaction.guild_id, interaction.member.user.id, RoleID), {
                    headers: {
                        'content-type': 'application/json',
                        Authorization: `Bot ${DISCORD_TOKEN}`,
                        'X-Audit-Log-Reason': localize(interaction.guild_locale, 'ROLE_BUTTON_AUDIT_LOG_ENTRY', `#${interaction.channel.name}`)
                    },
                    method: 'DELETE'
                });
                
                if ( revokeRoleRequest.status === 204 ) {
                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: localize(interaction.locale, 'ROLE_BUTTON_REVOKE_SUCCESS', `<@&${RoleID}>`)
                        }
                    });
                }
                else {
                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: localize(interaction.locale, 'ROLE_BUTTON_ERROR_REVOKE_FAILED', `<@&${RoleID}>`)
                        }
                    });
                }
            }
            catch (err) {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'ROLE_BUTTON_ERROR_REVOKE_FAILED', `<@&${RoleID}>`)
                    }
                });
            }
        }
        // Otherwise, swap the two Roles
        else {
            try {
                // Revoke old Role
                let revokeOldRoleRequest = await fetch(GuildMemberRoleEndpoint(interaction.guild_id, interaction.member.user.id, roleAlreadyHave), {
                    headers: {
                        'content-type': 'application/json',
                        Authorization: `Bot ${DISCORD_TOKEN}`,
                        'X-Audit-Log-Reason': localize(interaction.guild_locale, 'ROLE_BUTTON_AUDIT_LOG_ENTRY', `#${interaction.channel.name}`)
                    },
                    method: 'DELETE'
                });

                // Grant new Role
                let grantNewRoleRequest = await fetch(GuildMemberRoleEndpoint(interaction.guild_id, interaction.member.user.id, RoleID), {
                    headers: {
                        'content-type': 'application/json',
                        Authorization: `Bot ${DISCORD_TOKEN}`,
                        'X-Audit-Log-Reason': localize(interaction.guild_locale, 'ROLE_BUTTON_AUDIT_LOG_ENTRY', `#${interaction.channel.name}`)
                    },
                    method: 'PUT'
                });
                
                if ( revokeOldRoleRequest.status === 204 && grantNewRoleRequest.status === 204 ) {
                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: localize(interaction.locale, 'ROLE_BUTTON_SWAP_SUCCESS', `<@&${roleAlreadyHave}>`, `<@&${RoleID}>`)
                        }
                    });
                }
                else {
                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: localize(interaction.locale, 'ROLE_BUTTON_ERROR_SWAP_FAILED', `<@&${roleAlreadyHave}>`, `<@&${RoleID}>`)
                        }
                    });
                }
            }
            catch (err) {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'ROLE_BUTTON_ERROR_SWAP_FAILED', `<@&${roleAlreadyHave}>`, `<@&${RoleID}>`)
                    }
                });
            }
        }
    }
}






/**
 * Handles Role Button Interactions from SINGLE Menu Types
 * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction 
 * @param {String} RoleID
 */
async function singleRole(interaction, RoleID) {
    // Grab all the Roles on the Menu, to check if the Member already has any of them
    const MenuComponents = interaction.message.components;
    const MenuContainer = MenuComponents.find(comp => comp.type === ComponentType.Container);
    const MenuButtons = MenuContainer.components.filter(componentItem => componentItem.type === ComponentType.ActionRow);
    let menuRoleIds = [];
    MenuButtons.forEach(row => {
        row.components.forEach(button => {
            menuRoleIds.push(button.custom_id.split("_").pop());
        });
    });

    let memberHasRole = false;
    let roleAlreadyHave = null;
    menuRoleIds.forEach(idToCheck => {
        if ( interaction.member.roles.includes(idToCheck) ) {
            memberHasRole = true;
            roleAlreadyHave = idToCheck;
            return;
        }
    });


    // Member does NOT have any Roles, so grant requested Role
    if ( !memberHasRole ) {
        try {
            let grantRoleRequest = await fetch(GuildMemberRoleEndpoint(interaction.guild_id, interaction.member.user.id, RoleID), {
                headers: {
                    'content-type': 'application/json',
                    Authorization: `Bot ${DISCORD_TOKEN}`,
                    'X-Audit-Log-Reason': localize(interaction.guild_locale, 'ROLE_BUTTON_AUDIT_LOG_ENTRY', `#${interaction.channel.name}`)
                },
                method: 'PUT'
            });
            
            if ( grantRoleRequest.status === 204 ) {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'ROLE_BUTTON_GRANT_SUCCESS', `<@&${RoleID}>`)
                    }
                });
            }
            else {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'ROLE_BUTTON_ERROR_GRANT_FAILED', `<@&${RoleID}>`)
                    }
                });
            }
        }
        catch (err) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'ROLE_BUTTON_ERROR_GRANT_FAILED', `<@&${RoleID}>`)
                }
            });
        }
    }
    // Member DOES have a Role from this Menu already
    else {
        // Reject because this is a single-use Menu, and Members can't even self-revoke Roles from this type of Menu
        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.Ephemeral,
                content: localize(interaction.locale, 'ROLE_BUTTON_ERROR_SINGLE_USE_ONLY', `<@&${roleAlreadyHave}>`)
            }
        });
    }
}
