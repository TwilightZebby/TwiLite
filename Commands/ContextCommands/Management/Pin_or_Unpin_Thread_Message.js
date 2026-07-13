import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, MessageFlags, InteractionResponseType, MessageReferenceType, PermissionFlagsBits, ComponentType, ButtonStyle, ChannelType } from 'discord-api-types/v10';
import { checkForInfernoSku, JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { DefaultDiscordRequestHeaders, DefaultDiscordRequestHeadersWithAuditLog, SystemMessageTypes, ThreadLikeChannelTypes } from '../../../Utility/utilityConstants.js';
import { SKU_INFERNO_ID } from '../../../config.js';


export const ContextCommand = {
    /** Command's Name, supports both upper- and lower-case, and spaces
     * @type {String}
     */
    name: "Pin or Unpin Thread Message",

    /** Command's Description
     * @type {String}
     */
    description: "Pin/Unpin a Message in a Thread you own/created",

    /** Type of Context Command
     * @type {ApplicationCommandType}
     */
    commandType: ApplicationCommandType.Message,

    /** Command's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 5,
    

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

        return CommandData;
    },

    /** Runs the Command
     * @param {import('discord-api-types/v10').APIMessageApplicationCommandGuildInteraction|import('discord-api-types/v10').APIMessageApplicationCommandDMInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeCommand(interaction, interactionUser) {
        // INFERNO EARLY ACCESS
        // Check for Inferno status
        let guildHasInferno = checkForInfernoSku(interaction);

        // Check for Inferno status to be able to use this Command
        if ( guildHasInferno === false ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
                    /** @type {import('discord-api-types/v10').APIMessageTopLevelComponent[]} */
                    components: [{
                        type: ComponentType.TextDisplay,
                        content: localize(interaction.locale, 'PIN_THREAD_MESSAGE_COMMAND_MISSING_INFERNO_ACCESS')
                    }, {
                        type: ComponentType.ActionRow,
                        components: [{
                            type: ComponentType.Button,
                            style: ButtonStyle.Premium,
                            sku_id: SKU_INFERNO_ID
                        }]
                    }]
                }
            });
        }


        // Grab Message
        const SourceMessage = interaction.data.resolved.messages[interaction.data.target_id];

        // Validate TwiLite has permissions
        let appPerms = BigInt(interaction.app_permissions);
        // VIEW_CHANNEL
        if ( !((appPerms & PermissionFlagsBits.ViewChannel) == PermissionFlagsBits.ViewChannel) ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'PIN_THREAD_MESSAGE_COMMAND_ERROR_APP_MISSING_VIEW_CHANNEL_PERMISSION')
                }
            });
        }

        // PIN_MESSAGES
        if ( !((appPerms & PermissionFlagsBits.PinMessages) == PermissionFlagsBits.PinMessages) ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'PIN_THREAD_MESSAGE_COMMAND_ERROR_APP_MISSING_PIN_MESSAGES_PERMISSION')
                }
            });
        }

        // Validate not an App/System Message
        if ( SourceMessage.author.bot || SourceMessage.author.system || SystemMessageTypes.includes(SourceMessage.type) ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'CONTEXT_COMMAND_ERROR_SYSTEM_AND_BOT_MESSAGES_UNSUPPORTED')
                }
            });
        }

        // Fetch Message's source channel (for checking its type and thread owner id)
        let requestSourceChannel = await fetch(`https://discord.com/api/v10/channels/${SourceMessage.channel_id}`, {
            method: 'GET',
            headers: DefaultDiscordRequestHeaders
        });

        if ( requestSourceChannel.status !== 200 ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'PIN_THREAD_MESSAGE_COMMAND_ERROR_GENERIC')
                }
            });
        }
        /** @type {import('discord-api-types/v10').APIChannel} */
        const SourceChannel = await requestSourceChannel.json();

        // Validate Channel type
        if ( !ThreadLikeChannelTypes.includes(SourceChannel.type) ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'PIN_THREAD_MESSAGE_COMMAND_ERROR_MESSAGE_NOT_IN_THREAD')
                }
            });
        }

        // Validate User of command is the Thread Owner
        if ( SourceChannel.owner_id !== interactionUser.id ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'PIN_THREAD_MESSAGE_COMMAND_ERROR_USER_IS_NOT_THREAD_OWNER')
                }
            });
        }



        // Now attempt to pin or unpin message
        const pinActionType = SourceMessage.pinned === true ? 'UNPIN' : 'PIN';

        let defaultHeadersWithAuditLog = DefaultDiscordRequestHeadersWithAuditLog;
        defaultHeadersWithAuditLog['X-Audit-Log-Reason'] = pinActionType === 'PIN' ? localize(interaction.guild_locale, 'PIN_THREAD_MESSAGE_COMMAND_AUDIT_LOG_REASON_PIN', `${interactionUser.username}`)
            : localize(interaction.guild_locale, 'PIN_THREAD_MESSAGE_COMMAND_AUDIT_LOG_REASON_UNPIN', `${interactionUser.username}`);

        let requestPinMessage = await fetch(`https://discord.com/api/v10/channels/${SourceChannel.id}/messages/pins/${SourceMessage.id}`, {
            method: pinActionType === 'PIN' ? 'PUT' : 'DELETE',
            headers: defaultHeadersWithAuditLog
        });

        if ( requestPinMessage.status != 204 ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'PIN_THREAD_MESSAGE_COMMAND_ERROR_GENERIC')
                }
            });
        }
        else {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, pinActionType === 'PIN' ? 'PIN_THREAD_MESSAGE_COMMAND_PIN_SUCCESS' : 'PIN_THREAD_MESSAGE_COMMAND_UNPIN_SUCCESS')
                }
            });
        }
    }
}
