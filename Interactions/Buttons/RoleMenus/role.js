import { InteractionResponseType, MessageFlags, PermissionFlagsBits, TextInputStyle } from 'discord-api-types/v10';
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
    const SourceComponents = SourceMessage.components;
    let findMenuType = SourceComponents[0].components.find(component => component.id === 6);
    const SourceMenuType = findMenuType != undefined ? findMenuType.content.split(": ").pop() : undefined;
    let menuRequirementComponent = SourceComponents[0].components.find(component => component.id === 5);

    /** @type {Array<String>} */
    let menuRequirements = [];

    if ( menuRequirementComponent != undefined && menuRequirementComponent.content != "" ) {
        menuRequirements = Array.from(menuRequirementComponent.content.matchAll(RoleMentionRegEx), (m) => m[0]);
    }

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
        case "TOGGLE":
            return await toggleRole(interaction, RoleID);


        // Swappable Role Menu. Users can only have ONE Role at a time per SWAPPABLE Menu. Example use case: Colour Roles.
        case "SWAP":
            return await swapRole(interaction, RoleID);
            

        // Single-use Role Menu. Users can only use a SINGLE-USE Menu once, and cannot remove the Role they get nor swap it. Example use case: Team Roles for events.
        case "SINGLE":
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
    // Grab Role ID and cache
    const RoleId = interaction.data.custom_id.split("_").pop();
    const UserId = interaction.member.user.id;
    let menuCache = UtilityCollections.RoleMenuManagement.get(UserId);
    let currentLabel = undefined;
    let currentEmoji = undefined;

    // Grab current Label and/or Emoji
    for ( let i = 0; i <= menuCache.menuButtons.length - 1; i++ ) {
        if ( menuCache.menuButtons[i].data.custom_id.includes(RoleId) ) {
            currentLabel = menuCache.menuButtons[i].data.label;
            currentEmoji = menuCache.menuButtons[i].data.emoji != undefined && menuCache.menuButtons[i].data.emoji.id != undefined ? `<:${menuCache.menuButtons[i].data.emoji.name}:${menuCache.menuButtons[i].data.emoji.id}>`
            : menuCache.menuButtons[i].data.emoji != undefined && menuCache.menuButtons[i].data.emoji.id == undefined ? `${menuCache.menuButtons[i].data.emoji.name}`
            : undefined;
            break;
        }
    }


    // Construct & display Modal for editing Button
    const EditButtonModal = new ModalBuilder().setCustomId(`menu-edit-button_${RoleId}`).setTitle(localize(interaction.locale, 'ROLE_MENU_EDIT_BUTTON_LABEL')).addComponents([
        new ActionRowBuilder().addComponents([ new TextInputBuilder().setCustomId(`label`).setLabel(localize(interaction.locale, 'ROLE_MENU_BUTTON_LABEL')).setMaxLength(80).setStyle(TextInputStyle.Short).setRequired(false).setValue(currentLabel != undefined ? currentLabel : "") ]),
        new ActionRowBuilder().addComponents([ new TextInputBuilder().setCustomId(`emoji`).setLabel(localize(interaction.locale, 'ROLE_MENU_BUTTON_EMOJI')).setMaxLength(200).setPlaceholder(`<:grass_block:601353406577246208>, ✨`).setStyle(TextInputStyle.Short).setRequired(false).setValue(currentEmoji != undefined ? currentEmoji : "") ])
    ]);
    let editButtonModalJson = EditButtonModal.toJSON();

    return new JsonResponse({
        type: InteractionResponseType.Modal,
        data: editButtonModalJson
    });
}





/**
 * Handles Role Button Interactions from TOGGLE Menu Types
 * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction 
 * @param {String} RoleID
 */
async function toggleRole(interaction, RoleID) {
    // Check if Member already has Role
    if ( interaction.member?.roles.includes(RoleID) ) {
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
    const MenuButtons = interaction.message.components;
    let menuRoleIds = [];
    MenuButtons.forEach(row => {
        row.components.forEach(button => {
            menuRoleIds.push(button.custom_id.split("_").pop());
        });
    });

    let memberHasRole = false;
    let roleAlreadyHave = null;
    menuRoleIds.forEach(idToCheck => {
        if ( interaction.member?.roles.includes(idToCheck) ) {
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
        if ( interaction.member?.roles.includes(RoleID) ) {
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
    const MenuButtons = interaction.message.components;
    let menuRoleIds = [];
    MenuButtons.forEach(row => {
        row.components.forEach(button => {
            menuRoleIds.push(button.custom_id.split("_").pop());
        });
    });

    let memberHasRole = false;
    let roleAlreadyHave = null;
    menuRoleIds.forEach(idToCheck => {
        if ( interaction.member?.roles.includes(idToCheck) ) {
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
