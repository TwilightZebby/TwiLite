import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, MessageFlags, InteractionResponseType, PermissionFlagsBits, ComponentType, ButtonStyle, SeparatorSpacingSize } from 'discord-api-types/v10';
import { checkForInfernoSku, hexToRgb, JsonResponse, rgbArrayToInteger } from '../../../Utility/utilityMethods.js';
import { DISCORD_APP_USER_ID, SKU_INFERNO_ID } from '../../../config.js';
import { DefaultDiscordRequestHeaders } from '../../../Utility/utilityConstants.js';
import { localize } from '../../../Utility/localizeResponses.js';


export const SlashCommand = {
    /** Command's Name, in fulllowercase (can include hyphens)
     * @type {String}
     */
    name: "branding",

    /** Command's Description
     * @type {String}
     */
    description: "Manage TwiLite's appearance in this Server",

    /** Command's Localised Descriptions
     * @type {import('discord-api-types/v10').LocalizationMap}
     */
    localizedDescriptions: {
        'en-GB': "Manage TwiLite's appearance in this Server",
        'en-US': "Manage TwiLite's appearance in this Server"
    },

    /** Command's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 3,

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
        // Default Permission
        CommandData.default_member_permissions = String(PermissionFlagsBits.ManageGuild);

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
                        content: localize(interaction.locale, 'BRANDING_COMMAND_ERROR_GUILD_MISSING_INFERNO_SUBSCRIPTION')
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


        // Guild has Inferno!

        // First, grab TwiLite's private guild member object so we can see if it already has per-Guild User Profile stuff set
        //   Having to do it via a dummy Modify Current Member request because Discord hasn't granted Apps access to the Get Current Guild Member endpoint :c
        let requestCurrentMember = await fetch(`https://discord.com/api/v10/guilds/${interaction.guild_id}/members/${DISCORD_APP_USER_ID}`, {
            method: 'GET',
            headers: DefaultDiscordRequestHeaders
        });
        /** @type {import('discord-api-types/v10').APIGuildMember} */
        let currentGuildMember = await requestCurrentMember.json();

        let requestPrivateCurrentMember = await fetch(`https://discord.com/api/v10/guilds/${interaction.guild_id}/members/@me`, {
            method: 'PATCH',
            headers: DefaultDiscordRequestHeaders,
            body: JSON.stringify({
                "avatar": currentGuildMember.avatar
            })
        });

        /** @type {import('discord-api-types/v10').APIGuildMember} */
        let privateCurrentMember = await requestPrivateCurrentMember.json();

        // TODO: Figure out why this is broken now

        const HasPerGuildAvatarSet = privateCurrentMember.avatar != undefined ? true : false;
        const AvatarUri = HasPerGuildAvatarSet ? `https://cdn.discordapp.com/guilds/${interaction.guild_id}/users/${DISCORD_APP_USER_ID}/avatars/${privateCurrentMember.avatar}.png` : `https://cdn.discordapp.com/avatars/${DISCORD_APP_USER_ID}/${privateCurrentMember.user.avatar}.png`;
        const HasPerGuildBannerSet = privateCurrentMember.banner != undefined ? true : false;
        const BannerUri = HasPerGuildBannerSet ? `https://cdn.discordapp.com/guilds/${interaction.guild_id}/users/${DISCORD_APP_USER_ID}/banners/${privateCurrentMember.banner}.png` : `https://cdn.discordapp.com/banners/${DISCORD_APP_USER_ID}/${privateCurrentMember.user.banner}.png`;
        const HasPerGuildBioSet = privateCurrentMember.bio != undefined && privateCurrentMember.bio !== "" ? true : false;

        // Construct response!

        /** @type {import('discord-api-types/v10').APIMessageTopLevelComponent[]} */
        const ResponseComponents = [{
            "type": ComponentType.Container,
            "accent_color": rgbArrayToInteger(hexToRgb("#34C2C2")),
            "spoiler": false,
            "components": [{
                // PANEL HEADING
                "type": ComponentType.TextDisplay,
                "content": localize(interaction.locale, 'BRANDING_COMMAND_PANEL_HEADING')
            }, {
                "type": ComponentType.TextDisplay,
                "content": localize(interaction.locale, 'BRANDING_COMMAND_PANEL_DESCRIPTION')
            }, {
                "type": ComponentType.Separator,
                "divider": true,
                "spacing": SeparatorSpacingSize.Small
            }, {
                // AVATAR SECTION
                "type": ComponentType.Section,
                "components": [{
                    "type": ComponentType.TextDisplay,
                    "content": localize(interaction.locale, 'BRANDING_COMMAND_PANEL_AVATAR_SECTION_LABEL')
                }, {
                    "type": ComponentType.TextDisplay,
                    "content": HasPerGuildAvatarSet ? localize(interaction.locale, 'BRANDING_COMMAND_PANEL_AVATAR_SECTION_HAS_AVATAR_SET') : localize(interaction.locale, 'BRANDING_COMMAND_PANEL_AVATAR_SECTION_NO_AVATAR_SET')
                }],
                "accessory": {
                    "type": ComponentType.Thumbnail,
                    "spoiler": false,
                    "media": {
                        "url": AvatarUri
                    }
                }
            }, {
                // BANNER SECTION
                "type": ComponentType.Section,
                "components": [{
                    "type": ComponentType.TextDisplay,
                    "content": localize(interaction.locale, 'BRANDING_COMMAND_PANEL_BANNER_SECTION_LABEL')
                }, {
                    "type": ComponentType.TextDisplay,
                    "content": HasPerGuildBannerSet ? localize(interaction.locale, 'BRANDING_COMMAND_PANEL_BANNER_SECTION_HAS_BANNER_SET') : localize(interaction.locale, 'BRANDING_COMMAND_PANEL_BANNER_SECTION_NO_BANNER_SET')
                }],
                "accessory": {
                    "type": ComponentType.Thumbnail,
                    "spoiler": false,
                    "media": {
                        "url": BannerUri
                    }
                }
            }, {
                // BIO SECTION
                "type": ComponentType.TextDisplay,
                "content": localize(interaction.locale, 'BRANDING_COMMAND_PANEL_BIO_SECTION_LABEL')
            }, {
                "type": ComponentType.TextDisplay,
                "content": HasPerGuildBioSet ? localize(interaction.locale, 'BRANDING_COMMAND_PANEL_BIO_SECTION_HAS_BIO_SET') : localize(interaction.locale, 'BRANDING_COMMAND_PANEL_BIO_SECTION_NO_BIO_SET')
            }, {
                "type": ComponentType.Separator,
                "divider": true,
                "spacing": SeparatorSpacingSize.Small
            }, {
                // BUTTONS TO MANAGE
                "type": ComponentType.ActionRow,
                "components": [{
                    "type": ComponentType.Button,
                    "style": ButtonStyle.Primary,
                    "custom_id": `branding_bulk-edit`,
                    "label": localize(interaction.locale, 'BRANDING_COMMAND_PANEL_BUTTON_EDIT_LABEL')
                }, {
                    "type": ComponentType.Button,
                    "style": ButtonStyle.Danger,
                    "custom_id": `branding_reset`,
                    "label": localize(interaction.locale, 'BRANDING_COMMAND_PANEL_BUTTON_RESET_ALL_LABEL')
                }]
            }]
        }];


        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
                components: ResponseComponents
            }
        });
    }
}
