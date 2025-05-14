import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, MessageFlags, InteractionResponseType, ApplicationCommandOptionType, PermissionFlagsBits } from 'discord-api-types/v10';
import { JsonResponse, resolveImage } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { DISCORD_TOKEN } from '../../../config.js';


/** Allowed file content types for being uploaded as a Custom Emoji */
const AcceptedEmojiFileTypes = [ "image/png", "image/jpeg", "image/gif" ];


export const SlashCommand = {
    /** Command's Name, in fulllowercase (can include hyphens)
     * @type {String}
     */
    name: "lock-emoji",

    /** Command's Description
     * @type {String}
     */
    description: "Upload a role-locked emoji to this Server",

    /** Command's Localised Descriptions
     * @type {import('discord-api-types/v10').LocalizationMap}
     */
    localizedDescriptions: {
        'en-GB': 'Upload a role-locked emoji to this Server',
        'en-US': 'Upload a role-locked emoji to this Server'
    },

    /** Command's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 10,

    /**
     * Cooldowns for specific Subcommands
     */
    // Where "exampleName" is either the Subcommand's Name, or a combo of both Subcommand Group Name and Subcommand Name
    //  For ease in handling cooldowns, this should also include the root Command name as a prefix
    // In either "rootCommandName_subcommandName" or "rootCommandName_groupName_subcommandName" formats
    subcommandCooldown: {
        "exampleName": 3
    },
    

    /** Get the Command's data in a format able to be registered with via Discord's API
     * @returns {import('discord-api-types/v10').RESTPostAPIApplicationCommandsJSONBody}
     */
    getRegisterData() {
        /** @type {import('discord-api-types/v10').RESTPostAPIApplicationCommandsJSONBody} */
        const CommandData = {};

        CommandData.name = this.name;
        CommandData.description = this.description;
        CommandData.description_localizations = this.localizedDescriptions;
        CommandData.type = ApplicationCommandType.ChatInput;
        // Integration Types - 0 for GUILD_INSTALL, 1 for USER_INSTALL.
        //  MUST include at least one. 
        CommandData.integration_types = [ ApplicationIntegrationType.GuildInstall ];
        // Contexts - 0 for GUILD, 1 for BOT_DM (DMs with the App), 2 for PRIVATE_CHANNEL (DMs/GDMs that don't include the App).
        //  MUST include at least one. PRIVATE_CHANNEL can only be used if integration_types includes USER_INSTALL
        CommandData.contexts = [ InteractionContextType.Guild ];
        // Perms
        CommandData.default_member_permissions = String(PermissionFlagsBits.ManageRoles | PermissionFlagsBits.ManageGuildExpressions);
        // Options
        CommandData.options = [
            {
                type: ApplicationCommandOptionType.Attachment,
                name: "emoji",
                description: "Custom Emoji to upload to this Server",
                description_localizations: {
                    'en-GB': "Custom Emoji to upload to this Server",
                    'en-US': "Custom Emoji to upload to this Server"
                },
                required: true
            },
            {
                type: ApplicationCommandOptionType.Role,
                name: "role",
                description: "Role to lock use of this Emoji behind",
                description_localizations: {
                    'en-GB': "Role to lock use of this Emoji behind",
                    'en-US': "Role to lock use of this Emoji behind"
                },
                required: true
            }
        ];

        return CommandData;
    },

    /** Handles given Autocomplete Interactions, should this Command use Autocomplete Options
     * @param {import('discord-api-types/v10').APIApplicationCommandAutocompleteInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async handleAutoComplete(interaction, interactionUser) {
        return new JsonResponse({
            type: InteractionResponseType.ApplicationCommandAutocompleteResult,
            data: {
                choices: [ {name: "Not implemented yet!", value: "NOT_IMPLEMENTED"} ]
            }
        });
    },

    /** Runs the Command
     * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     * @param {String} usedCommandName 
     */
    async executeCommand(interaction, interactionUser, usedCommandName) {
        // Ensure App has permissions to upload Custom Emojis
        let appPerms = BigInt(interaction.app_permissions);

        if ( !((appPerms & PermissionFlagsBits.ManageGuildExpressions) == PermissionFlagsBits.ManageGuildExpressions) ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'LOCKEMOJI_COMMAND_ERROR_MISSING_MANAGE_EXPRESSIONS_PERMISSION')
                }
            });
        }

        // Grab inputs
        const InputAttachment = interaction.data.options.find(option => option.type === ApplicationCommandOptionType.Attachment);
        const ResolvedAttachment = interaction.data.resolved.attachments[InputAttachment.value];
        const InputRole = interaction.data.options.find(option => option.type === ApplicationCommandOptionType.Role);


        // **** VALIDATE ATTACHMENT
        // Check Attachment file type
        if ( !AcceptedEmojiFileTypes.includes(ResolvedAttachment.content_type) ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'LOCKEMOJI_COMMAND_ERROR_INVALID_FILE_TYPE')
                }
            });
        }

        // Check Attachment file size
        if ( ResolvedAttachment.size >= 256_000 ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'LOCKEMOJI_COMMAND_ERROR_FILE_TOO_LARGE')
                }
            });
        }


        // Now attempt to upload emoji
        let resolvedEmojiData = await resolveImage(ResolvedAttachment.url);
        let uploadEmojiName = ResolvedAttachment.filename.endsWith(".png") || ResolvedAttachment.filename.endsWith(".gif") || ResolvedAttachment.filename.endsWith(".jpg") ? ResolvedAttachment.filename.slice(0, -4) : ResolvedAttachment.filename.slice(0, -5);

        let uploadEmojiAttempt = await fetch(`https://discord.com/api/v10/guilds/${interaction.guild_id}/emojis`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bot ${DISCORD_TOKEN}`,
                'X-Audit-Log-Reason': localize(interaction.guild_locale, 'LOCKEMOJI_COMMAND_AUDIT_LOG_EMOJI_UPLOADED', interactionUser.username)
            },
            method: 'POST',
            body: JSON.stringify({
                name: `${uploadEmojiName}`,
                image: `${resolvedEmojiData}`,
                roles: [ InputRole.value ]
            })
        });


        // ACK
        if ( uploadEmojiAttempt.status === 201 ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'LOCKEMOJI_COMMAND_UPLOAD_SUCCESS')
                }
            });
        }
        else {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'LOCKEMOJI_COMMAND_ERROR_GENERIC')
                }
            });
        }
    }
}
