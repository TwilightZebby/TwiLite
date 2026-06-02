import { ButtonStyle, ChannelType, ComponentType, InteractionResponseType, MessageFlags, SelectMenuDefaultValueType, SeparatorSpacingSize, TextInputStyle } from 'discord-api-types/v10';
import { hexToRgb, JsonResponse, rgbArrayToInteger } from '../../Utility/utilityMethods.js';
import { localize } from '../../Utility/localizeResponses.js';
import { EMOJI_TWITCH_LOGO } from '../../Assets/AppEmojis.js';
import { DefaultDiscordRequestHeaders, TwitchApiClient } from '../../Utility/utilityConstants.js';


/**
 * @typedef {Object} TwitchGoLiveConfig
 * @property {String} TwitchWebhookSubscriptionId The ID of the Twitch Webhook Subscription
 * @property {String} TwitchChannelId ID of the Twitch Channel this notification is for
 * @property {String} TwitchChannelName Username of the Twitch Channel this notification is for
 * @property {String} DiscordChannelId ID of the Discord Channel to post this notification in
 * @property {Boolean} IsNotificationEnabled Should a notification be sent when the Twitch Channel goes live?
 * @property {import('discord-api-types/v10').Locale} DiscordGuildLocale The locale for the Discord Guild. Used so we don't have to call Discord's API every time a new Notification is sent.
 * @property {String} CustomMessage A custom notification message for going live, or an empty string if Default Message is wanted instead
 * @property {Array<String>} PingRoleIds An array of Role IDs for Roles to ping in the go live notification, or an empty array for no Roles
 * @property {Boolean} AutoPublishAnnouncement Should the notification be automatically published, if posting to an Announcement Channel on Discord. Will be force set to FALSE if `DiscordChannelId` does not point to an Announcement-type Channel.
 * @public
 */

/**
 * @typedef {Object} TwitchNotificationConfig
 * @property {String} DiscordGuildId ID of the Discord Server this set of Twitch Notifications is for
 * @property {Array<TwitchGoLiveConfig>} TwitchGoLiveConfig Configuration settings for handling "Going live" notifications from Twitch
 * @public
 */

/**
 * @typedef {Object} TwitchStreamUpEventSubData
 * @property {String} id ID of the Twitch Stream
 * @property {String} broadcaster_user_id User ID of the stream's Broadcaster
 * @property {String} broadcaster_user_login User handle of the stream's Broadcaster (in full lowercase)
 * @property {String} broadcaster_user_name User display name of the stream's broadcaster (can have uppercase letters)
 * @property {'live'|'playlist'|'watch_party'|'premiere'|'rerun'} type The type of stream
 * @property {String} started_at The timestamp the stream went online at.
 * @public
 */

/**
 * @typedef {Object} TwitchDeduplicationData
 * @property {String} messageId ID of the Twitch EventSub Message
 * @property {String} messageTimestamp Timestamp of when the Twitch EventSub Message was sent, in RFC3339 format
 * @public
 */


/**
 * Outputs a list of all current Twitch Notifications setup for the Server. Also includes management buttons.
 * 
 * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction 
 * @param {*} cfEnv 
 * @param {'NEW'|'EDIT'} outputType Whether this list should output as a new response, or editing an existing response
 */
export async function listTwitchNotifications(interaction, cfEnv, outputType) {
    // Grab current saved Twitch Notifs, if any
    /** @type {?Array<TwitchNotificationConfig>} */
    let fetchedTwitchNotifs = JSON.parse(await cfEnv.crimsonkv.get(`twitchNotifications`));
    let guildTwitchNotifs = fetchedTwitchNotifs?.find(item => item.DiscordGuildId === interaction.guild_id);

    // Basic components for management panel
    /** @type {import('discord-api-types/v10').APIMessageTopLevelComponent[]} */
    let responseComponents = [{
        "type": ComponentType.Container,
        "accent_color": rgbArrayToInteger(hexToRgb('#8956FB')),
        "spoiler": false,
        "components": [{
            "type": ComponentType.TextDisplay,
            "content": localize(interaction.locale, 'TWITCH_NOTIF_PANEL_HEADING')
        }, {
            "type": ComponentType.TextDisplay,
            "content": localize(interaction.locale, 'TWITCH_NOTIF_PANEL_DESCRIPTION')
        }, {
            "type": ComponentType.Separator,
            "divider": true,
            "spacing": SeparatorSpacingSize.Small
        }]
    }];


    if ( fetchedTwitchNotifs == null || fetchedTwitchNotifs.length === 0 || guildTwitchNotifs == undefined || guildTwitchNotifs.TwitchGoLiveConfig.length === 0 ) {
        // No stored configs found, output empty management panel
        responseComponents[0].components.push({
            "type": ComponentType.TextDisplay,
            "content": localize(interaction.locale, 'TWITCH_NOTIF_PANEL_EMPTY_PLACEHOLDER')
        }, {
            "type": ComponentType.Separator,
            "divider": true,
            "spacing": SeparatorSpacingSize.Small
        }, {
            "type": ComponentType.ActionRow,
            "components": [{
                "type": ComponentType.Button,
                "style": ButtonStyle.Primary,
                "custom_id": `twitch_add`,
                "label": localize(interaction.locale, 'TWITCH_NOTIF_PANEL_BUTTON_ADD_NEW')
            }]
        });
    }
    else {
        // There are set configs found, output management panel for them
        guildTwitchNotifs.TwitchGoLiveConfig.forEach(item => {
            responseComponents[0].components.push({
                "type": ComponentType.Section,
                "accessory": {
                    "type": ComponentType.Button,
                    "style": ButtonStyle.Secondary,
                    "custom_id": `twitch_edit_${item.TwitchChannelId}`,
                    "label": localize(interaction.locale, 'TWITCH_NOTIF_PANEL_BUTTON_EDIT')
                },
                "components": [{
                    "type": ComponentType.TextDisplay,
                    "content": `**[${item.TwitchChannelName}](<https://twitch.tv/${item.TwitchChannelName}>)**\n> -# ${localize(interaction.locale, 'TWITCH_NOTIF_PANEL_ITEM_POSTS_IN_CHANNEL', `<#${item.DiscordChannelId}>`)} | ${item.PingRoleIds?.length === 1 ? localize(interaction.locale, 'TWITCH_NOTIF_PANEL_ITEM_ROLE_PING_COUNT_SINGLAR') : localize(interaction.locale, 'TWITCH_NOTIF_PANEL_ITEM_ROLE_PING_COUNT_MULTIPLE', `${item.PingRoleIds?.length ?? 0}`)} ${item.CustomMessage != "" ? `| ${localize(interaction.locale, 'TWITCH_NOTIF_PANEL_ITEM_HAS_CUSTOM_MESSAGE')}` : ""}`
                }]
            })
        });

        // Add final buttons
        if ( guildTwitchNotifs.TwitchGoLiveConfig.length < 2 ) {
            // Maximum limit not reached
            responseComponents[0].components.push({
                "type": ComponentType.Separator,
                "divider": true,
                "spacing": SeparatorSpacingSize.Small
            }, {
                "type": ComponentType.ActionRow,
                "components": [{
                    "type": ComponentType.Button,
                    "style": ButtonStyle.Primary,
                    "custom_id": `twitch_add`,
                    "label": localize(interaction.locale, 'TWITCH_NOTIF_PANEL_BUTTON_ADD_NEW')
                }, {
                    "type": ComponentType.Button,
                    "style": ButtonStyle.Danger,
                    "custom_id": `twitch_reset`,
                    "label": localize(interaction.locale, 'TWITCH_NOTIF_PANEL_BUTTON_RESET')
                }]
            });
        }
        else {
            // Disabled version with notice because max limit was reached
            responseComponents[0].components.push({
                "type": ComponentType.Separator,
                "divider": true,
                "spacing": SeparatorSpacingSize.Small
            }, {
                "type": ComponentType.ActionRow,
                "components": [{
                    "type": ComponentType.Button,
                    "style": ButtonStyle.Primary,
                    "custom_id": `twitch_add`,
                    "label": localize(interaction.locale, 'TWITCH_NOTIF_PANEL_BUTTON_ADD_NEW'),
                    "disabled": true
                }, {
                    "type": ComponentType.Button,
                    "style": ButtonStyle.Danger,
                    "custom_id": `twitch_reset`,
                    "label": localize(interaction.locale, 'TWITCH_NOTIF_PANEL_BUTTON_RESET')
                }]
            }, {
                "type": ComponentType.TextDisplay,
                "content": `-# ${localize(interaction.locale, 'TWITCH_NOTIF_PANEL_NOTE_MAXIMUM_LIMIT_REACHED')}`
            });
        }
    }


    if ( outputType === 'NEW' ) {
        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
                components: responseComponents
            }
        });
    }
    else {
        return new JsonResponse({
            type: InteractionResponseType.UpdateMessage,
            data: {
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
                components: responseComponents
            }
        });
    }
}








/**
 * Shows a modal to allow the User to edit a selected Twitch Notification, including an option to delete it.
 * 
 * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction 
 * @param {*} cfEnv 
 * @param {String} twitchId The Twitch ID for the Twitch Notification to edit
 */
export async function editTwitchNotification(interaction, cfEnv, twitchId) {
    // Grab selected Twitch Notification
    /** @type {Array<TwitchNotificationConfig>} */
    let fetchedTwitchNotifs = JSON.parse(await cfEnv.crimsonkv.get(`twitchNotifications`));
    let guildTwitchNotifs = fetchedTwitchNotifs.find(item => item.DiscordGuildId === interaction.guild_id);
    let selectedTwitchNotification = guildTwitchNotifs.TwitchGoLiveConfig.find(item => item.TwitchChannelId === twitchId);

    // Setting default values
    let defaultRoleValues = [];
    selectedTwitchNotification.PingRoleIds.forEach(role => {
        defaultRoleValues.push({ "id": role, "type": SelectMenuDefaultValueType.Role });
    });

    // Construct Modal to allow editing/deletion of this
    /** @type {import('discord-api-types/v10').APIModalInteractionResponseCallbackData} */
    let responseEditModal = {
        "custom_id": `twitch_edit_${twitchId}`,
        "title": localize(interaction.locale, 'TWITCH_NOTIF_EDIT_MODAL_TITLE'),
        "components": [{
            // Description
            "type": ComponentType.TextDisplay,
            "content": localize(interaction.locale, 'TWITCH_NOTIF_EDIT_MODAL_DESCRIPTION', `${selectedTwitchNotification.TwitchChannelName}`)
        }, {
            // Discord Channel to post in
            "type": ComponentType.Label,
            "label": localize(interaction.locale, 'TWITCH_NOTIF_EDIT_MODAL_DISCORD_CHANNEL_LABEL_NAME'),
            "description": localize(interaction.locale, 'TWITCH_NOTIF_EDIT_MODAL_DISCORD_CHANNEL_LABEL_DESCRIPTION'),
            "component": {
                "type": ComponentType.ChannelSelect,
                "custom_id": `discord-channel`,
                "channel_types": [ ChannelType.GuildText, ChannelType.GuildAnnouncement ],
                "max_values": 1,
                "required": false,
                "default_values": [{ "id": selectedTwitchNotification.DiscordChannelId, "type": SelectMenuDefaultValueType.Channel }]
            }
        }, {
            // Roles to ping in "go live" notification
            "type": ComponentType.Label,
            "label": localize(interaction.locale, 'TWITCH_NOTIF_EDIT_MODAL_ROLES_TO_PING_LABEL_NAME'),
            "description": localize(interaction.locale, 'TWITCH_NOTIF_EDIT_MODAL_ROLES_TO_PING_LABEL_DESCRIPTION'),
            "component": {
                "type": ComponentType.RoleSelect,
                "custom_id": `roles-pinged`,
                "max_values": 2,
                "required": false,
                "default_values": defaultRoleValues.length > 0 ? defaultRoleValues : undefined
            }
        }, {
            // Custom message for "go live" notification
            "type": ComponentType.Label,
            "label": localize(interaction.locale, 'TWITCH_NOTIF_EDIT_MODAL_CUSTOM_MESSAGE_LABEL_NAME'),
            "description": localize(interaction.locale, 'TWITCH_NOTIF_EDIT_MODAL_CUSTOM_MESSAGE_LABEL_DESCRIPTION'),
            "component": {
                "type": ComponentType.TextInput,
                "style": TextInputStyle.Paragraph,
                "custom_id": `custom-message`,
                "max_length": 250,
                "required": false,
                "value": selectedTwitchNotification.CustomMessage != "" && selectedTwitchNotification.CustomMessage != null ? selectedTwitchNotification.CustomMessage : undefined
            }
        }, {
            // Checkbox for setting deletion state
            "type": ComponentType.Label,
            "label": localize(interaction.locale, 'TWITCH_NOTIF_EDIT_DELETION_LABEL_NAME'),
            "description": localize(interaction.locale, 'TWITCH_NOTIF_EDIT_DELETION_LABEL_DESCRIPTION', `${selectedTwitchNotification.TwitchChannelName}`),
            "component": {
                "type": ComponentType.Checkbox,
                "custom_id": `deletion-state`
            }
        }]
    };


    // ACK
    return new JsonResponse({
        type: InteractionResponseType.Modal,
        data: responseEditModal
    });
}








/**
 * Processes "going live" Twitch API Events
 * 
 * @param {TwitchStreamUpEventSubData} streamUpEventData 
 * @param {import('@twurple/api').HelixStream} twitchStreamData 
 * @param {import('@twurple/api').HelixGame|null} streamCategory 
 * @param {TwitchGoLiveConfig} goLiveConfig 
 * @param {*} cfEnv 
 */
export async function processStreamOnlineEvents(streamUpEventData, twitchStreamData, streamCategory, goLiveConfig, cfEnv) {
    let streamStartDate = Date.parse(streamUpEventData.started_at);

    // Construct Discord Components to send notification in
    let pingRolesString = "";
    if ( goLiveConfig.PingRoleIds.length > 0 ) {
        goLiveConfig.PingRoleIds.forEach(roleId => { pingRolesString += `<@&${roleId}> ` });
    }
    
    /** @type {import('discord-api-types/v10').APIMessageTopLevelComponent} */
    let topComponent = {};
    if ( streamCategory != null ) {
        topComponent = {
            "type": ComponentType.Section,
            "accessory": {
                "type": ComponentType.Thumbnail,
                "media": { "url": streamCategory.getBoxArtUrl(120, 120) },
                "spoiler": false
            },
            "components": [{
                "type": ComponentType.TextDisplay,
                "content": `### ${pingRolesString}${pingRolesString.length > 0 ? ' ' : ''}${goLiveConfig.CustomMessage.length == 0 ? `**${localize(goLiveConfig.DiscordGuildLocale, 'TWITCH_NOTIFICATION_GOING_LIVE_DEFAULT_MESSAGE', streamUpEventData.broadcaster_user_name)}**` : ` ${goLiveConfig.CustomMessage.replace("{streamerName}", streamUpEventData.broadcaster_user_name)}`}\n${twitchStreamData.title}`
            }]
        };
    }
    else {
        topComponent = {
            "type": ComponentType.TextDisplay,
            "content": `### ${pingRolesString}${pingRolesString.length > 0 ? ' ' : ''}${goLiveConfig.CustomMessage.length == 0 ? `**${localize(goLiveConfig.DiscordGuildLocale, 'TWITCH_NOTIFICATION_GOING_LIVE_DEFAULT_MESSAGE', streamUpEventData.broadcaster_user_name)}**` : ` ${goLiveConfig.CustomMessage.replace("{streamerName}", streamUpEventData.broadcaster_user_name)}`}\n${twitchStreamData.title}`
        };
    }

    
    /** @type {import('discord-api-types/v10').APIMessageTopLevelComponent[]} */
    let notifMessageComponents = [{
        "type": ComponentType.Container,
        "accent_color": rgbArrayToInteger(hexToRgb("#8956FB")),
        "spoiler": false,
        "components": [
            topComponent,
            {
                "type": ComponentType.TextDisplay,
                "content": `### ${localize(goLiveConfig.DiscordGuildLocale, 'TWITCH_NOTIFICATION_GOING_LIVE_CATEGORY')}\n${twitchStreamData.gameName != "" ? twitchStreamData.gameName : `*No category set*`}`
            },
            {
                "type": ComponentType.MediaGallery,
                "items": [{
                    "media": { "url": twitchStreamData.getThumbnailUrl(1920, 1080) },
                    "spoiler": twitchStreamData.isMature
                }]
            },
            {
                "type": ComponentType.TextDisplay,
                "content": `-# ${localize(goLiveConfig.DiscordGuildLocale, 'TWITCH_NOTIFICATION_GOING_LIVE_WENT_LIVE', `<t:${Math.floor(streamStartDate / 1000)}:R>`)}`
            },
            {
                "type": ComponentType.ActionRow,
                "components": [{
                    "type": ComponentType.Button,
                    "style": ButtonStyle.Link,
                    "url": `https://twitch.tv/${streamUpEventData.broadcaster_user_login}`,
                    "label": `${localize(goLiveConfig.DiscordGuildLocale, 'TWITCH_NOTIFICATION_GOING_LIVE_WATCH_BUTTON_LABEL')}`,
                    "emoji": { "id": EMOJI_TWITCH_LOGO.id, "name": EMOJI_TWITCH_LOGO.name }
                }]
            }
        ]
    }];


    // Get VOD link, if one exists
    let fetchVod = await TwitchApiClient.videos.getVideosByUser(streamUpEventData.broadcaster_user_id, {
        type: 'archive',
        limit: 1
    });

    if ( fetchVod?.data?.length === 1 ) {
        let latestVod = fetchVod.data[0];

        // Ensure Vod is for current stream
        if ( latestVod.streamId === streamUpEventData.id ) {
            // Add Vod button to components
            notifMessageComponents[0].components[4].components.push({
                "type": ComponentType.Button,
                "style": ButtonStyle.Link,
                "url": `${latestVod.url}`,
                "label": `${localize(goLiveConfig.DiscordGuildLocale, 'TWITCH_NOTIFICATION_GOING_LIVE_VOD_BUTTON_LABEL')}`,
                "emoji": { "id": EMOJI_TWITCH_LOGO.id, "name": EMOJI_TWITCH_LOGO.name }
            });
        }
    }


    // Now sent into Discord channel
    let requestCreateMessage = await fetch(`https://discord.com/api/v10/channels/${goLiveConfig.DiscordChannelId}/messages`, {
        method: 'POST',
        headers: DefaultDiscordRequestHeaders,
        body: JSON.stringify({
            "flags": MessageFlags.IsComponentsV2,
            "components": notifMessageComponents
        })
    });

    // If posting to an announcement channel AND `AutoPublishAnnouncement` config field is `true`, cross-post the message
    if ( (requestCreateMessage.status === 200) && (goLiveConfig.AutoPublishAnnouncement === true) ) {
        /** @type {import('discord-api-types/v10').APIMessage} */
        let returnedCreatedMessage = await requestCreateMessage.json();

        let requestPublishMessage = await fetch(`https://discord.com/api/v10/channels/${goLiveConfig.DiscordChannelId}/messages/${returnedCreatedMessage.id}/crosspost`, {
            method: 'POST',
            headers: DefaultDiscordRequestHeaders
        });
    }
    
    return;
}
