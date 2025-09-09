import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, MessageFlags, InteractionResponseType, PermissionFlagsBits, ComponentType, ButtonStyle } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { DISCORD_APP_USER_ID } from '../../../config.js';
import { localize } from '../../../Utility/localizeResponses.js';


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
                    content: localize(interaction.locale, '')
                }
            });
        }

        if ( checkForMenuType == undefined || !(checkForMenuType.content.includes("Menu Type:")) ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, '')
                }
            });
        }


        // Confirmation buttons
        /** @type {import('discord-api-types/v10').APIMessageTopLevelComponent[]} */
        let confirmationComponents = [
            {
                "type": ComponentType.TextDisplay,
                "content": localize(interaction.locale, 'DELETE_ROLE_MENU_COMMAND_VALIDATION')
            },
            {
                "type": ComponentType.ActionRow,
                "components": [
                    {
                        "type": ComponentType.Button,
                        "custom_id": `menu-delete_confirm_${SourceMessage.id}`,
                        "label": localize(interaction.locale, 'DELETE_ROLE_MENU_CONFIRMATION_BUTTON_LABEL'),
                        "style": ButtonStyle.Danger
                    },
                    {
                        "type": ComponentType.Button,
                        "custom_id": `menu-delete_cancel`,
                        "label": localize(interaction.locale, 'DELETE_ROLE_MENU_CANCEL_BUTTON_LABEL'),
                        "style": ButtonStyle.Secondary
                    }
                ]
            }
        ];


        // ACK
        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
                components: confirmationComponents,
                "allowed_mentions": { "parse": [] }
            }
        });
    }
}
