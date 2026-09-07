import { ButtonStyle, ChannelType, ComponentType, InteractionResponseType, MessageFlags, SelectMenuDefaultValueType, SeparatorSpacingSize, TextInputStyle } from 'discord-api-types/v10';
import { hexToRgb, JsonResponse, resolveImage, rgbArrayToInteger } from '../../Utility/utilityMethods.js';
import { localize } from '../../Utility/localizeResponses.js';
import { EMOJI_TWITCH_LOGO } from '../../Assets/AppEmojis.js';
import { DefaultDiscordRequestHeaders, getTwitchApiClient } from '../../Utility/utilityConstants.js';


/**
 * @typedef {Object} SchemaTwitchGoLiveNotifications
 * Data of a Twitch Notification Config, using data types accepted by SQLite
 * 
 * @property {String} notification_id ID of this Notification Config
 * @property {String} discord_guild_id ID of the Discord Guild this Twitch Notification is to be posted in
 * @property {String} twitch_channel_id ID of the Twitch Channel this notification is for
 * @property {String} twitch_channel_name Username of the Twitch Channel this notification is for
 * @property {String} discord_guild_locale The locale for the Discord Guild. Used so we don't have to call Discord's API every time a new Notification is sent.
 * @property {Number} is_notification_enabled Should a notification be sent when the Twitch Channel goes live? (0 for FALSE, 1 for TRUE)
 * @property {String} twitch_golive_webhook_subscription_id The ID of the Twitch Webhook Subscription for going live
 * @property {?String} twitch_categoryupdate_webhook_subscription_id The ID of the Twitch Webhook Subscription for the stream changing category
 * @property {?String} twitch_streamend_webhook_subscription_id The ID of the Twitch Webhook Subscription for the stream ending
 * @property {String} discord_channel_id ID of the Discord Channel to post this notification in
 * @property {?String} custom_message A custom notification message for going live
 * @property {?String} ping_role_id A Role ID of the Role to ping in the go live notification
 * @property {Number} auto_publish_announcement Should the notification be automatically published, if posting to an Announcement Channel on Discord. Will be force set to FALSE if `DiscordChannelId` does not point to an Announcement-type Channel. (0 for FALSE, 1 for TRUE)
 * @property {Number} update_on_category_change Should the posted notification be updated when the stream's category is updated from Twitch? (Currently always FALSE due to being WIP) (0 for FALSE, 1 for TRUE)
 * @property {Number} update_on_stream_end Should the posted notification be updated to reflect when the stream has ended? (Currently always FALSE due to being WIP) (0 for FALSE, 1 for TRUE)
 * 
 * @public
 */

/**
 * @typedef {Object} TypeCastedTwitchGoLiveNotifications
 * The same as `SchemaTwitchGoLiveNotifications`, but types have been casted to their true values
 * 
 * @property {String} notification_id ID of this Notification Config
 * @property {String} discord_guild_id ID of the Discord Guild this Twitch Notification is to be posted in
 * @property {String} twitch_channel_id ID of the Twitch Channel this notification is for
 * @property {String} twitch_channel_name Username of the Twitch Channel this notification is for
 * @property {import('discord-api-types/v10').Locale} discord_guild_locale The locale for the Discord Guild. Used so we don't have to call Discord's API every time a new Notification is sent.
 * @property {Boolean} is_notification_enabled Should a notification be sent when the Twitch Channel goes live?
 * @property {String} twitch_golive_webhook_subscription_id The ID of the Twitch Webhook Subscription for going live
 * @property {?String} twitch_categoryupdate_webhook_subscription_id The ID of the Twitch Webhook Subscription for the stream changing category
 * @property {?String} twitch_streamend_webhook_subscription_id The ID of the Twitch Webhook Subscription for the stream ending
 * @property {String} discord_channel_id ID of the Discord Channel to post this notification in
 * @property {?String} custom_message A custom notification message for going live
 * @property {?String} ping_role_id A Role ID of the Role to ping in the go live notification
 * @property {Boolean} auto_publish_announcement Should the notification be automatically published, if posting to an Announcement Channel on Discord. Will be force set to FALSE if `DiscordChannelId` does not point to an Announcement-type Channel.
 * @property {Boolean} update_on_category_change Should the posted notification be updated when the stream's category is updated from Twitch? (Currently always FALSE due to being WIP)
 * @property {Boolean} update_on_stream_end Should the posted notification be updated to reflect when the stream has ended? (Currently always FALSE due to being WIP)
 * 
 * @public
 */

/**
 * @typedef {Object} TwitchStreamUpEventSubData
 * Received API data from Twitch when a stream goes live
 * 
 * @property {String} id ID of the Twitch Stream
 * @property {String} broadcaster_user_id User ID of the stream's Broadcaster
 * @property {String} broadcaster_user_login User handle of the stream's Broadcaster (in full lowercase)
 * @property {String} broadcaster_user_name User display name of the stream's broadcaster (can have uppercase letters)
 * @property {'live'|'playlist'|'watch_party'|'premiere'|'rerun'} type The type of stream
 * @property {String} started_at The timestamp the stream went online at.
 * 
 * @public
 */

/**
 * @typedef {Object} SchemaTwitchDeduplicationData
 * @property {String} message_id ID of the Twitch EventSub Message
 * @property {String} message_timestamp_iso Timestamp of when the Twitch EventSub Message was sent, in RFC3339 format
 * @property {Number} message_timestamp_unix UNIX Timestamp of when the Twitch EventSub Message was sent, in milliseconds
 * 
 * @public
 */


/**
 * Takes the passed raw data from the Twitch Notifications database, and converts it into the correct typings
 * 
 * @param {SchemaTwitchGoLiveNotifications} rawSchemaData 
 * 
 * @returns {TypeCastedTwitchGoLiveNotifications}
 */
export async function castTwitchNotifSchemaToTypedData(rawSchemaData) {
    return {
        notification_id: rawSchemaData.notification_id,
        discord_guild_id: rawSchemaData.discord_guild_id,
        twitch_channel_id: rawSchemaData.twitch_channel_id,
        twitch_channel_name: rawSchemaData.twitch_channel_name,
        discord_guild_locale: rawSchemaData.discord_guild_locale,
        is_notification_enabled: rawSchemaData.is_notification_enabled === 0 ? false : true,
        twitch_golive_webhook_subscription_id: rawSchemaData.twitch_golive_webhook_subscription_id,
        twitch_categoryupdate_webhook_subscription_id: rawSchemaData.twitch_categoryupdate_webhook_subscription_id,
        twitch_streamend_webhook_subscription_id: rawSchemaData.twitch_streamend_webhook_subscription_id,
        discord_channel_id: rawSchemaData.discord_channel_id,
        custom_message: rawSchemaData.custom_message,
        ping_role_id: rawSchemaData.ping_role_id,
        auto_publish_announcement: rawSchemaData.auto_publish_announcement === 0 ? false : true,
        update_on_category_change: rawSchemaData.update_on_category_change === 0 ? false : true,
        update_on_stream_end: rawSchemaData.update_on_stream_end === 0 ? false : true
    };
}


/**
 * Takes the passed typed data and converts it into SQLite-compatible data for storing in Twitch Notifications database
 * 
 * @param {TypeCastedTwitchGoLiveNotifications} typedData 
 * 
 * @returns {SchemaTwitchGoLiveNotifications}
 */
export async function castTwitchNotifTypedDataToSchema(typedData) {
    return {
        notification_id: typedData.notification_id,
        discord_guild_id: typedData.discord_guild_id,
        twitch_channel_id: typedData.twitch_channel_id,
        twitch_channel_name: typedData.twitch_channel_name,
        discord_guild_locale: typedData.discord_guild_locale,
        is_notification_enabled: typedData.is_notification_enabled === false ? 0 : 1,
        twitch_golive_webhook_subscription_id: typedData.twitch_golive_webhook_subscription_id,
        twitch_categoryupdate_webhook_subscription_id: typedData.twitch_categoryupdate_webhook_subscription_id,
        twitch_streamend_webhook_subscription_id: typedData.twitch_streamend_webhook_subscription_id,
        discord_channel_id: typedData.discord_channel_id,
        custom_message: typedData.custom_message,
        ping_role_id: typedData.ping_role_id,
        auto_publish_announcement: typedData.auto_publish_announcement === false ? 0 : 1,
        update_on_category_change: typedData.update_on_category_change === false ? 0 : 1,
        update_on_stream_end: typedData.update_on_stream_end === false ? 0 : 1
    };
}


/**
 * Outputs a list of all current Twitch Notifications setup for the Server. Also includes management buttons.
 * 
 * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction 
 * @param {*} cfEnv 
 * @param {'NEW'|'EDIT'} outputType Whether this list should output as a new response, or editing an existing response
 */
export async function listTwitchNotifications(interaction, cfEnv, outputType) {
    // Grab current saved Twitch Notifs, if any
    /** @type {{results: Array<SchemaTwitchGoLiveNotifications>}} */
    const { results } = await cfEnv.DATABASE
        .prepare("SELECT * FROM TwitchNotifications WHERE discord_guild_id = ?")
        .bind(interaction.guild_id)
        .run();

    
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


    if ( results == null || results.length === 0 ) {
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
        results.forEach(item => {
            responseComponents[0].components.push({
                "type": ComponentType.Section,
                "accessory": {
                    "type": ComponentType.Button,
                    "style": ButtonStyle.Secondary,
                    "custom_id": `twitch_manage_${item.twitch_channel_id}`,
                    "label": localize(interaction.locale, 'TWITCH_NOTIF_PANEL_BUTTON_EDIT')
                },
                "components": [{
                    "type": ComponentType.TextDisplay,
                    "content": `**[${item.twitch_channel_name}](<https://twitch.tv/${item.twitch_channel_name}>)**\n> -# ${localize(interaction.locale, 'TWITCH_NOTIF_PANEL_ITEM_POSTS_IN_CHANNEL', `<#${item.discord_channel_id}>`)} ${item.ping_role_id !== null ? `| ${localize(interaction.locale, 'TWITCH_NOTIF_PANEL_ITEM_ROLE_PING', `<@&${item.ping_role_id}>`)} ` : ''}${item.custom_message != null ? `| ${localize(interaction.locale, 'TWITCH_NOTIF_PANEL_ITEM_HAS_CUSTOM_MESSAGE')}` : ""}`
                }]
            })
        });


        // Add final buttons
        if ( results.length < 5 ) {
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


    // Display response to User
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
 * Shows the page used to edit or delete a single, specific, Twitch Notification
 * 
 * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction 
 * @param {*} cfEnv 
 * @param {String} twitchChannelId The Twitch ID of the Channel to show this management page for
 */
export async function showManageTwitchNotificationPage(interaction, cfEnv, twitchChannelId) {
    // Grab the config for this specific Twitch Notification
    /** @type {{results: Array<SchemaTwitchGoLiveNotifications>}} */
    const { results } = await cfEnv.DATABASE
        .prepare("SELECT * FROM TwitchNotifications WHERE discord_guild_id = ? AND twitch_channel_id = ? LIMIT 1")
        .bind(interaction.guild_id, twitchChannelId)
        .run();

    const FetchedTwitchNotif = results.shift();

    
    // Basic components for management panel
    /** @type {import('discord-api-types/v10').APIMessageTopLevelComponent[]} */
    let responseComponents = [{
        "type": ComponentType.Container,
        "accent_color": rgbArrayToInteger(hexToRgb('#8956FB')),
        "spoiler": false,
        "components": [{
            "type": ComponentType.TextDisplay,
            "content": localize(interaction.locale, 'TWITCH_NOTIF_EDIT_PANEL_HEADING')
        }, {
            "type": ComponentType.TextDisplay,
            "content": localize(interaction.locale, 'TWITCH_NOTIF_EDIT_PANEL_DESCRIPTION', FetchedTwitchNotif.twitch_channel_name)
        }, {
            "type": ComponentType.Separator,
            "divider": true,
            "spacing": SeparatorSpacingSize.Small
        }]
    }];

    
    // Assemble current settings into a displayed string
    let currentSettingsString = "";

    currentSettingsString += `${localize(interaction.locale, 'TWITCH_NOTIF_EDIT_PANEL_CURRENT_SETTINGS')}`;
    // Discord Channel
    currentSettingsString += `\n- ${localize(interaction.locale, 'TWITCH_NOTIF_EDIT_PANEL_DISCORD_CHANNEL', `<#${FetchedTwitchNotif.discord_channel_id}>`)}`;
    // Pings Role
    if ( FetchedTwitchNotif.ping_role_id != null ) { currentSettingsString += `\n- ${localize(interaction.locale, 'TWITCH_NOTIF_EDIT_PANEL_PINGS_ROLE', `<@&${FetchedTwitchNotif.ping_role_id}>`)}`; }
    else { currentSettingsString += `\n- ${localize(interaction.locale, 'TWITCH_NOTIF_EDIT_PANEL_DOES_NOT_PING_ROLE')}`; }
    // Auto Publishes
    if ( FetchedTwitchNotif.auto_publish_announcement === 1 ) { currentSettingsString += `\n- ${localize(interaction.locale, 'TWITCH_NOTIF_EDIT_PANEL_AUTO_PUBLISHES')}`; }
    else { currentSettingsString += `\n- ${localize(interaction.locale, 'TWITCH_NOTIF_EDIT_PANEL_DOES_NOT_AUTO_PUBLISH')}`; }
    // Update on stream end (PLACEHOLDER FOR NOW)
    //if ( FetchedTwitchNotif.update_on_stream_end === 1 ) { currentSettingsString += `\n- ${localize(interaction.locale, 'TWITCH_NOTIF_EDIT_PANEL_UPDATES_ON_STREAM_END')}`; }
    //else { currentSettingsString += `\n- ${localize(interaction.locale, 'TWITCH_NOTIF_EDIT_PANEL_DOES_NOT_UPDATE_ON_STREAM_END')}`; }
    // Custom Message
    if ( FetchedTwitchNotif.custom_message != null ) { currentSettingsString += `\n- ${localize(interaction.locale, 'TWITCH_NOTIF_EDIT_PANEL_CUSTOM_MESSAGE', FetchedTwitchNotif.custom_message)}`; }
    else { currentSettingsString += `\n- ${localize(interaction.locale, 'TWITCH_NOTIF_EDIT_PANEL_HAS_NO_CUSTOM_MESSAGE')}`; }

    responseComponents[0].components.push({
        "type": ComponentType.TextDisplay,
        "content": currentSettingsString
    });


    // Add Buttons
    responseComponents[0].components.push({
        "type": ComponentType.Separator,
        "divider": true,
        "spacing": SeparatorSpacingSize.Small
    }, {
        "type": ComponentType.ActionRow,
        "components": [{
            "type": ComponentType.Button,
            "style": ButtonStyle.Secondary,
            "custom_id": `twitch_return`,
            "label": localize(interaction.locale, 'TWITCH_NOTIF_EDIT_PANEL_BUTTON_CANCEL')
        }, {
            "type": ComponentType.Button,
            "style": ButtonStyle.Secondary,
            "custom_id": `twitch_edit_${FetchedTwitchNotif.twitch_channel_id}`,
            "label": localize(interaction.locale, 'TWITCH_NOTIF_EDIT_PANEL_BUTTON_EDIT')
        }, {
            "type": ComponentType.Button,
            "style": ButtonStyle.Danger,
            "custom_id": `twitch_delete_${FetchedTwitchNotif.twitch_channel_id}_${FetchedTwitchNotif.twitch_channel_name}`,
            "label": localize(interaction.locale, 'TWITCH_NOTIF_EDIT_PANEL_BUTTON_DELETE')
        }]
    });


    // Display response to User
    return new JsonResponse({
        type: InteractionResponseType.UpdateMessage,
        data: {
            components: responseComponents
        }
    });
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
    /** @type {{results: Array<SchemaTwitchGoLiveNotifications>}} */
    const { results } = await cfEnv.DATABASE
        .prepare("SELECT * FROM TwitchNotifications WHERE discord_guild_id = ? AND twitch_channel_id = ? LIMIT 1")
        .bind(interaction.guild_id, twitchId)
        .run();

    // For ease
    const FetchedConfig = results.shift();

    // Setting default values
    let defaultRoleValues = [];
    if ( FetchedConfig.ping_role_id != null ) {
        defaultRoleValues.push({ "id": FetchedConfig.ping_role_id, "type": SelectMenuDefaultValueType.Role });
    }


    // Construct Modal to allow editing/deletion of this
    /** @type {import('discord-api-types/v10').APIModalInteractionResponseCallbackData} */
    let responseEditModal = {
        "custom_id": `twitch_edit_${twitchId}`,
        "title": localize(interaction.locale, 'TWITCH_NOTIF_EDIT_MODAL_TITLE'),
        "components": [{
            // Description
            "type": ComponentType.TextDisplay,
            "content": localize(interaction.locale, 'TWITCH_NOTIF_EDIT_MODAL_DESCRIPTION', `${FetchedConfig.twitch_channel_name}`)
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
                "required": true,
                "default_values": [{ "id": FetchedConfig.discord_channel_id, "type": SelectMenuDefaultValueType.Channel }]
            }
        }, {
            // Roles to ping in "go live" notification
            "type": ComponentType.Label,
            "label": localize(interaction.locale, 'TWITCH_NOTIF_EDIT_MODAL_ROLES_TO_PING_LABEL_NAME'),
            "description": localize(interaction.locale, 'TWITCH_NOTIF_EDIT_MODAL_ROLES_TO_PING_LABEL_DESCRIPTION'),
            "component": {
                "type": ComponentType.RoleSelect,
                "custom_id": `roles-pinged`,
                "max_values": 1,
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
                "value": FetchedConfig.custom_message != null ? FetchedConfig.custom_message : undefined
            }
        }/* , {
            // Checkbox for setting deletion state
            "type": ComponentType.Label,
            "label": localize(interaction.locale, 'TWITCH_NOTIF_EDIT_DELETION_LABEL_NAME'),
            "description": localize(interaction.locale, 'TWITCH_NOTIF_EDIT_DELETION_LABEL_DESCRIPTION', `${FetchedConfig.twitch_channel_name}`),
            "component": {
                "type": ComponentType.Checkbox,
                "custom_id": `deletion-state`
            }
        } */]
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
 * @param {SchemaTwitchGoLiveNotifications} notificationConfig 
 * @param {*} cfEnv 
 */
export async function processStreamOnlineEvents(streamUpEventData, twitchStreamData, streamCategory, notificationConfig, cfEnv) {
    let streamStartDate = Date.parse(streamUpEventData.started_at);

    // Construct Discord Components to send notification in
    let pingRolesString = "";
    if ( notificationConfig.ping_role_id != null ) {
        pingRolesString += `<@&${notificationConfig.ping_role_id}> `;
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
                "content": `### ${pingRolesString}${pingRolesString.length > 0 ? ' ' : ''}${notificationConfig.custom_message == null ? `**${localize(notificationConfig.discord_guild_locale, 'TWITCH_NOTIFICATION_GOING_LIVE_DEFAULT_MESSAGE', streamUpEventData.broadcaster_user_name)}**` : ` ${notificationConfig.custom_message.replace("{streamerName}", streamUpEventData.broadcaster_user_name)}`}\n${twitchStreamData.title}`
            }]
        };
    }
    else {
        topComponent = {
            "type": ComponentType.TextDisplay,
            "content": `### ${pingRolesString}${pingRolesString.length > 0 ? ' ' : ''}${notificationConfig.custom_message == null ? `**${localize(notificationConfig.discord_guild_locale, 'TWITCH_NOTIFICATION_GOING_LIVE_DEFAULT_MESSAGE', streamUpEventData.broadcaster_user_name)}**` : ` ${notificationConfig.custom_message.replace("{streamerName}", streamUpEventData.broadcaster_user_name)}`}\n${twitchStreamData.title}`
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
                "content": `### ${localize(notificationConfig.discord_guild_locale, 'TWITCH_NOTIFICATION_GOING_LIVE_CATEGORY')}\n${twitchStreamData.gameName != "" ? twitchStreamData.gameName : `*No category set*`}`
            },
            {
                "type": ComponentType.MediaGallery,
                "items": [{
                    // Prev. 1920 x 1080
                    "media": { "url": `${twitchStreamData.getThumbnailUrl(320, 180)}?r=${twitchStreamData.id}` },
                    "spoiler": twitchStreamData.isMature
                }]
            },
            {
                "type": ComponentType.TextDisplay,
                "content": `-# ${localize(notificationConfig.discord_guild_locale, 'TWITCH_NOTIFICATION_GOING_LIVE_WENT_LIVE', `<t:${Math.floor(streamStartDate / 1000)}:R>`)}`
            },
            {
                "type": ComponentType.ActionRow,
                "components": [{
                    "type": ComponentType.Button,
                    "style": ButtonStyle.Link,
                    "url": `https://twitch.tv/${streamUpEventData.broadcaster_user_login}`,
                    "label": `${localize(notificationConfig.discord_guild_locale, 'TWITCH_NOTIFICATION_GOING_LIVE_WATCH_BUTTON_LABEL')}`,
                    "emoji": { "id": EMOJI_TWITCH_LOGO.id, "name": EMOJI_TWITCH_LOGO.name }
                }]
            }
        ]
    }];


    // Get VOD link, if one exists
    const TwitchApiClient = getTwitchApiClient();
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
                "label": `${localize(notificationConfig.discord_guild_locale, 'TWITCH_NOTIFICATION_GOING_LIVE_VOD_BUTTON_LABEL')}`,
                "emoji": { "id": EMOJI_TWITCH_LOGO.id, "name": EMOJI_TWITCH_LOGO.name }
            });
        }
    }


    // Now send into Discord channel
    let requestCreateMessage = await fetch(`https://discord.com/api/v10/channels/${notificationConfig.discord_channel_id}/messages`, {
        method: 'POST',
        headers: DefaultDiscordRequestHeaders,
        body: JSON.stringify({
            "flags": MessageFlags.IsComponentsV2,
            "components": notifMessageComponents
        })
    });

    // If posting to an announcement channel AND `GoLiveAutoPublishAnnouncement` config field is `true`, cross-post the message
    if ( (requestCreateMessage.status === 200) && (notificationConfig.auto_publish_announcement === 1) ) {
        /** @type {import('discord-api-types/v10').APIMessage} */
        let returnedCreatedMessage = await requestCreateMessage.json();

        let requestPublishMessage = await fetch(`https://discord.com/api/v10/channels/${notificationConfig.discord_channel_id}/messages/${returnedCreatedMessage.id}/crosspost`, {
            method: 'POST',
            headers: DefaultDiscordRequestHeaders
        });
    }
    
    return;
}
