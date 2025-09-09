import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, MessageFlags, InteractionResponseType, PermissionFlagsBits, ComponentType, SeparatorSpacingSize } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { DISCORD_APP_USER_ID } from '../../../config.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from '@discordjs/builders';


export const ContextCommand = {
    /** Command's Name, supports both upper- and lower-case, and spaces
     * @type {String}
     */
    name: "Edit Role Menu",

    /** Command's Description
     * @type {String}
     */
    description: "Edit an existing Role Menu",

    /** Type of Context Command
     * @type {ApplicationCommandType}
     */
    commandType: ApplicationCommandType.Message,

    /** Command's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 15,
    

    /** Get the Command's data in a format able to be registered with via Discord's API
     * @returns {import('discord-api-types/v10').RESTPostAPIApplicationCommandsJSONBody}
     */
    getRegisterData() {
        /** @type {import('discord-api-types/v10').RESTPostAPIApplicationCommandsJSONBody} */
        const CommandData = {};

        CommandData.name = this.name;
        CommandData.description = "";
        CommandData.type = this.commandType;
        // Integration Types - 0 for GUILD_INSTALL, 1 for USER_INSTALL.
        //  MUST include at least one. 
        CommandData.integration_types = [ ApplicationIntegrationType.GuildInstall ];
        // Contexts - 0 for GUILD, 1 for BOT_DM (DMs with the App), 2 for PRIVATE_CHANNEL (DMs/GDMs that don't include the App).
        //  MUST include at least one. PRIVATE_CHANNEL can only be used if integration_types includes USER_INSTALL
        CommandData.contexts = [ InteractionContextType.Guild ];
        // Default Command Permission Requirement
        CommandData.default_member_permissions = String(PermissionFlagsBits.ManageRoles);

        return CommandData;
    },

    /** Runs the Command
     * @param {import('discord-api-types/v10').APIMessageApplicationCommandGuildInteraction|import('discord-api-types/v10').APIMessageApplicationCommandDMInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeCommand(interaction, interactionUser) {
        // Grab data
        const SourceMessage = interaction.data.resolved.messages[interaction.data.target_id];
        const SourceComponents = SourceMessage.components;
        let checkForMenuType = SourceComponents[0].components.find(comp => comp.id === 30);


        // Validate Command was used on a Role Menu by this App
        if ( SourceMessage.author.id !== DISCORD_APP_USER_ID ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'EDIT_ROLE_MENU_COMMAND_ERROR_MESSAGE_INVALID')
                }
            });
        }

        if ( checkForMenuType == undefined || !(checkForMenuType.content.includes("Menu Type:")) ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'EDIT_ROLE_MENU_COMMAND_ERROR_MESSAGE_INVALID')
                }
            });
        }


        // Validate permission checks
        let appPerms = BigInt(interaction.app_permissions);
        // MANAGE_ROLES Permission (needed to be able to grant/revoke Roles)
        if ( !((appPerms & PermissionFlagsBits.ManageRoles) == PermissionFlagsBits.ManageRoles) ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'EDIT_ROLE_MENU_COMMAND_ERROR_MISSING_MANAGE_ROLE_PERMISSION')
                }
            });
        }

        // VIEW_MESSAGE_HISTORY Perm (needed to be able to edit the Role Menu)
        if ( !((appPerms & PermissionFlagsBits.ReadMessageHistory) == PermissionFlagsBits.ReadMessageHistory) ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'EDIT_ROLE_MENU_COMMAND_ERROR_MISSING_MESSAGE_HISTORY_PERMISSION')
                }
            });
        }


        // Merge Role Menu's Container component into the configuration components
        /** @type {import('discord-api-types/v10').APIMessageTopLevelComponent[]} */
        let configurationComponents = [
            {
                "id": 1,
                "type": ComponentType.TextDisplay,
                "content": localize(interaction.locale, 'ROLE_MENU_CONFIGURATION_INTRUCTIONS')
            },
            {
                "id": 2,
                "type": ComponentType.Separator,
                "divider": false,
                "spacing": SeparatorSpacingSize.Small
            },
            SourceComponents[0],
            {
                "id": 40,
                "type": ComponentType.ActionRow,
                "components": [
                    new StringSelectMenuBuilder().setId(21).setCustomId(`configure-role-menu_${SourceMessage.id}`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(interaction.locale, 'ROLE_MENU_SELECT_AN_ACTION')).setOptions([
                        new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_SET_MENU_TYPE')).setValue("set-type").setDescription(localize(interaction.locale, 'ROLE_MENU_SET_MENU_TYPE_DESCRIPTION')).setEmoji({ name: `🔧` }),
                        new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_CONFIGURE_EMBED')).setValue("edit-details").setDescription(localize(interaction.locale, 'ROLE_MENU_CONFIGURE_EMBED_DESCRIPTION')).setEmoji({ name: EMOJI_ICON_OLD_RICH_PRESENCE.name, id: EMOJI_ICON_OLD_RICH_PRESENCE.id }),
                        new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_ADD_ROLE')).setValue("add-role").setDescription(localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_DESCRIPTION')).setEmoji({ name: EMOJI_ROLE_ADD.name, id: EMOJI_ROLE_ADD.id }),
                        new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_REMOVE_ROLE')).setValue("remove-role").setDescription(localize(interaction.locale, 'ROLE_MENU_REMOVE_ROLE_DESCRIPTION')).setEmoji({ name: EMOJI_ROLE_REMOVE.name, id: EMOJI_ROLE_REMOVE.id }),
                        new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_ADD_REQUIREMENT')).setValue("add-requirement").setDescription(localize(interaction.locale, 'ROLE_MENU_ADD_REQUIREMENT_DESCRIPTION')).setEmoji({ name: EMOJI_REQUIREMENT_ADD.name, id: EMOJI_REQUIREMENT_ADD.id }),
                        new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_REMOVE_REQUIREMENT')).setValue("remove-requirement").setDescription(localize(interaction.locale, 'ROLE_MENU_REMOVE_REQUIREMENT_DESCRIPTION')).setEmoji({ name: EMOJI_REQUIREMENT_REMOVE.name, id: EMOJI_REQUIREMENT_REMOVE.id }),
                        new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_SAVE_AND_POST')).setValue("save").setDescription(localize(interaction.locale, 'ROLE_MENU_SAVE_AND_POST_DESCRIPTION')).setEmoji({ name: EMOJI_ICON_ROCKET.name, id: EMOJI_ICON_ROCKET.id }),
                        new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_CANCEL_CONFIGURATION')).setValue("cancel").setDescription(localize(interaction.locale, 'OLE_MENU_CANCEL_CONFIGURATION_DESCRIPTION')).setEmoji({ name: `❌`})
                    ]).toJSON()
                ]
            }
        ];


        // ACK
        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
                components: configurationComponents,
                "allowed_mentions": { "parse": [] }
            }
        });
    }
}
