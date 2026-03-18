import { ButtonStyle, ComponentType, InteractionResponseType, MessageFlags, SeparatorSpacingSize } from 'discord-api-types/v10';
import { DISCORD_APP_USER_ID } from '../config.js';
import { DefaultDiscordRequestHeaders } from '../Utility/utilityConstants.js';
import { localize } from '../Utility/localizeResponses.js';
import { hexToRgb, JsonResponse, rgbArrayToInteger } from '../Utility/utilityMethods.js';



/**
 * Displays the current status of TwiLite's branding for the Guild. Also includes management buttons.
 * 
 * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction 
 * @param {'NEW'|'EDIT'} outputType Whether this list should output as a new response, or editing an existing response
 * @param {import('discord-api-types/v10').APIGuildMember|null} currentMember The PRIVATE current member data, if this is being called *after* updating branding
 */
export async function showBrandingPanel(interaction, outputType, currentMember) {
    /** @type {import('discord-api-types/v10').APIGuildMember} */
    let privateCurrentMember;

    if ( currentMember == null ) {
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
                "banner": currentGuildMember.banner
            })
        });

        privateCurrentMember = await requestPrivateCurrentMember.json();
    }
    else {
        privateCurrentMember = currentMember;
    }

    const HasPerGuildAvatarSet = privateCurrentMember.avatar != undefined ? true : false;
    const AvatarUri = HasPerGuildAvatarSet ? `https://cdn.discordapp.com/guilds/${interaction.guild_id}/users/${DISCORD_APP_USER_ID}/avatars/${privateCurrentMember.avatar}.png` : `https://cdn.discordapp.com/avatars/${DISCORD_APP_USER_ID}/${privateCurrentMember.user.avatar}.png`;
    const HasPerGuildBannerSet = privateCurrentMember.banner != undefined ? true : false;
    const BannerUri = HasPerGuildBannerSet ? `https://cdn.discordapp.com/guilds/${interaction.guild_id}/users/${DISCORD_APP_USER_ID}/banners/${privateCurrentMember.banner}.png` : `https://cdn.discordapp.com/banners/${DISCORD_APP_USER_ID}/${privateCurrentMember.user.banner}.png`;
    const HasPerGuildBioSet = privateCurrentMember.bio != undefined && privateCurrentMember.bio !== "" ? true : false;
    // This one is PURELY so we can disable the "Reset" button when there is no Branding set
    const AllowResetButton = !(HasPerGuildAvatarSet || HasPerGuildBannerSet || HasPerGuildBioSet);

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
                "label": localize(interaction.locale, 'BRANDING_COMMAND_PANEL_BUTTON_RESET_ALL_LABEL'),
                "disabled": AllowResetButton
            }]
        }]
    }];


    if ( outputType === 'NEW' ) {
        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
                components: ResponseComponents
            }
        });
    }
    else {
        return new JsonResponse({
            type: InteractionResponseType.UpdateMessage,
            data: {
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
                components: ResponseComponents
            }
        });
    }
}
