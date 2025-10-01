import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, MessageFlags, InteractionResponseType, PermissionFlagsBits, ApplicationCommandOptionType, ChannelType, InviteFlags } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { DISCORD_TOKEN } from '../../../config.js';
import { encodedSuperProperties } from '../../../Utility/utilityConstants.js';


export const SlashCommand = {
    /** Command's Name, in fulllowercase (can include hyphens)
     * @type {String}
     */
    name: "invite-guest",

    /** Command's Description
     * @type {String}
     */
    description: "Create a Guest Invite for a Voice Channel in this Server",

    /** Command's Localised Descriptions
     * @type {import('discord-api-types/v10').LocalizationMap}
     */
    localizedDescriptions: {
        'en-GB': 'Create a Guest Invite for a Voice Channel in this Server',
        'en-US': 'Create a Guest Invite for a Voice Channel in this Server'
    },

    /** Command's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 30,

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
        // Default Permission Requirements
        CommandData.default_member_permissions = String(PermissionFlagsBits.CreateInstantInvite);
        // Options
        CommandData.options = [
            {
                "type": ApplicationCommandOptionType.Channel,
                "name": "channel",
                "description": "Voice Channel to invite your Guest to",
                "description_localizations": {
                    'en-GB': "Voice Channel to invite your Guest to",
                    'en-US': "Voice Channel to invite your Guest to"
                },
                "required": true,
                "channel_types": [ ChannelType.GuildVoice ]
            },
            {
                "type": ApplicationCommandOptionType.Integer,
                "name": "expiry-age",
                "description": "IN SECONDS, how long should this Guest Invite exist before expiring? Use 0 to never expire.",
                "description_localizations": {
                    'en-GB': "IN SECONDS, how long should this Guest Invite exist before expiring? Use 0 to never expire.",
                    'en-US': "IN SECONDS, how long should this Guest Invite exist before expiring? Use 0 to never expire."
                },
                "min_value": 0,
                "max_value": 5184000,
                "required": false
            },
            {
                "type": ApplicationCommandOptionType.Integer,
                "name": "max-uses",
                "description": "Number of uses before this Guest Invite expires. Use 0 for unlimited uses.",
                "description_localizations": {
                    'en-GB': "Number of uses before this Guest Invite expires. Use 0 for unlimited uses.",
                    'en-US': "Number of uses before this Guest Invite expires. Use 0 for unlimited uses."
                },
                "min_value": 0,
                "max_value": 100,
                "required": false
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
        // Grab needed data first
        const InputChannel = interaction.data.options.find(option => option.type === ApplicationCommandOptionType.Channel);
        const ResolvedChannel = interaction.data.resolved.channels[InputChannel.value];
        /** @type {import('discord-api-types/v10').APIApplicationCommandInteractionDataIntegerOption|undefined} */
        const InputExpiryAge = interaction.data.options.find(option => option.name === "expiry-age");
        /** @type {import('discord-api-types/v10').APIApplicationCommandInteractionDataIntegerOption|undefined} */
        const InputMaxUses = interaction.data.options.find(option => option.name === "max-uses");
        /** @type {import('discord-api-types/v10').APIGuild|undefined} */
        let fetchedGuild = undefined;

        // Fetch Guild data so we can perform checks
        let getGuildRequest = await fetch(`https://discord.com/api/v10/guilds/${interaction.guild_id}?with_counts=true`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bot ${DISCORD_TOKEN}`
            },
            method: 'GET'
        });

        // Error handling
        if ( getGuildRequest.status != 200 && getGuildRequest.status != 204 ){
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'INVITE_GUEST_COMMAND_ERROR_FAILED_TO_CHECK_GUILDS_ACCESS_TO_FEATURE')
                }
            });
        }

        fetchedGuild = await getGuildRequest.json();


        // ******* Ensure Guild can make Voice Guest Invites
        if ( fetchedGuild.approximate_member_count > 200 ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'INVITE_GUEST_COMMAND_ERROR_GUILD_TOO_LARGE')
                }
            });
        }

        if ( fetchedGuild.vanity_url_code != null ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'INVITE_GUEST_COMMAND_ERROR_GUILD_HAS_VANITY_SET')
                }
            });
        }

        if ( fetchedGuild.features.includes("GUILD_ONBOARDING_HAS_PROMPTS") ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'INVITE_GUEST_COMMAND_ERROR_GUILD_HAS_ONBOARDING_PROMPTS_SET')
                }
            });
        }


        // Attempt to make Invite!
        // Set defaults for optional stuff
        let setMaxAge = InputExpiryAge == undefined ? 86400 : InputExpiryAge.value;
        let setMaxUses = InputMaxUses == undefined ? 0 : InputMaxUses.value;

        let postInviteRequest = await fetch(`https://discord.com/api/v10/channels/${InputChannel.value}/invites`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bot ${DISCORD_TOKEN}`,
                'X-Audit-Log-Reason': localize(interaction.guild_locale, 'INVITE_GUEST_COMMAND_SUCCESS_AUDIT_LOG_ENTRY', `@${interaction.member.user.username}`),
                'X-Super-Properties': encodedSuperProperties
            },
            method: 'POST',
            body: JSON.stringify({
                "flags": Number(InviteFlags.IsGuestInvite),
                "max_age": Number(InputExpiryAge?.value ?? 86400),
                "max_uses": Number(InputMaxUses?.value ?? 0)
            })
        });
        let createdInviteJson = await postInviteRequest.json();
        console.log(`${postInviteRequest.status} - ${postInviteRequest.statusText}`);
        let tempJson = JSON.stringify(createdInviteJson);
        console.log(tempJson);


        // Catch "unexpected 204 empty response" (caused by Invites being force-disabled for that Guild by Discord's T&S team)
        if ( postInviteRequest.status === 204 ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'INVITE_GUEST_COMMAND_ERROR_GUILD_HAS_INVITES_DISABLED_BY_DISCORD')
                }
            });
        }

        // App didn't have CREATE_INSTANT_INVITE Permission
        if ( postInviteRequest.status === 403 ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'INVITE_GUEST_COMMAND_ERROR_APP_MISSING_CREATE_INVITE_PERMISSION', `<#${InputChannel.value}>`)
                }
            });
        }

        // "Bad Request" response
        if ( postInviteRequest.status === 400 ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'INVITE_GUEST_COMMAND_ERROR_FAILED_TO_CREATE_INVITE', `<#${InputChannel.value}>`)
                }
            });
        }

        // Invite created successfully
        if ( postInviteRequest.status === 200 || postInviteRequest.status === 201 ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'INVITE_GUEST_COMMAND_SUCCESS_MESSAGE', `<#${InputChannel.value}>`, `${createdInviteJson["code"]}`)
                }
            });
        }
    }
}
