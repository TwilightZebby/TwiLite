import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, MessageFlags, InteractionResponseType, PermissionFlagsBits, ButtonStyle } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { DISCORD_APP_USER_ID } from '../../../config.js';
import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';

// Role Menu Types
const RoleMenuTypes = [ "TOGGLE", "SWAP", "SINGLE" ];


export const ContextCommand = {
    /** Command's Name, supports both upper- and lower-case, and spaces
     * @type {String}
     */
    name: "Delete Role Menu",

    /** Command's Description
     * @type {String}
     */
    description: "Deletes an existing Role Menu",

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
        // Default Command Permission Requirements
        CommandData.default_member_permissions = String(PermissionFlagsBits.ManageRoles);

        return CommandData;
    },

    /** Runs the Command
     * @param {import('discord-api-types/v10').APIMessageApplicationCommandGuildInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeCommand(interaction, interactionUser) {
        // Grab data
        const SourceMessage = interaction.data.resolved.messages[interaction.data.target_id];
        const SourceEmbed = SourceMessage.embeds.shift();
        const SourceMenuType = SourceEmbed?.footer?.text.split(": ").pop();
        const SourceComponents = SourceMessage.components;

        // Validate Message this was used on *does* contain one of TwiLite's Role Menus
        if ( SourceMessage.author.id !== DISCORD_APP_USER_ID ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'EDIT_ROLE_MENU_COMMAND_ERROR_MESSAGE_INVALID')
                }
            });
        }

        if ( SourceMenuType == undefined || !RoleMenuTypes.includes(SourceMenuType) ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'EDIT_ROLE_MENU_COMMAND_ERROR_MESSAGE_INVALID')
                }
            });
        }


        // Construct confirmation buttons
        const ConfirmationButtonRow = new ActionRowBuilder().addComponents([
            new ButtonBuilder().setCustomId(`menu-delete_confirm_${SourceMessage.id}`).setLabel(localize(interaction.locale, 'DELETE')).setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`menu-delete_cancel`).setLabel(localize(interaction.locale, 'CANCEL')).setStyle(ButtonStyle.Secondary)
        ]);
        let confirmationButtonJson = ConfirmationButtonRow.toJSON();
        

        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.Ephemeral,
                content: localize(interaction.locale, 'DELETE_ROLE_MENU_COMMAND_VALIDATION'),
                components: [confirmationButtonJson]
            }
        });
    }
}
