import { Collection } from '@discordjs/collection';
import { MessageType } from 'discord-api-types/v10';
import { AppTokenAuthProvider } from '@twurple/auth';
import { ApiClient } from '@twurple/api';
import { CF_WORKER_URL, DISCORD_TOKEN, RANDOMLY_GENERATED_FIXED_STRING, superProperties, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } from '../config.js';
import { EventSubHttpListener, ReverseProxyAdapter } from '@twurple/eventsub-http';


const TwitchAuthProvider = new AppTokenAuthProvider(TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET);

const TwitchAdapter = new ReverseProxyAdapter({
    hostName: `${CF_WORKER_URL}`,
    pathPrefix: `/twitch-webhooks`
});


// *******************************
//  Exports

/**
 * API client for interacting with Twitch's API
 */
export const TwitchApiClient = new ApiClient({ authProvider: TwitchAuthProvider });

/**
 * Event Listener for receiving Twitch Events via HTTP Webhooks
 */
export const TwitchHttpListener = new EventSubHttpListener({ apiClient: TwitchApiClient, secret: RANDOMLY_GENERATED_FIXED_STRING, adapter: TwitchAdapter });

/**
 * Base64-encoded Super Properties for accessing experimental API features
 */
export const encodedSuperProperties = Buffer.from(superProperties).toString('base64');

/** Utility & Command/Interaction Collections */
export const UtilityCollections = {
    /** Holds all Cooldowns for Slash Commands, mapped by "commandName_userID"
     * @type {Collection<String, Number>} 
     */
    SlashCooldowns: new Collection(),

    /** Holds all Cooldowns for Context Commands, mapped by "commandName_userID"
     * @type {Collection<String, Number>} 
     */
    ContextCooldowns: new Collection(),

    /** Holds all Cooldowns for Button Interactions, mapped by "buttonName_userID"
     * @type {Collection<String, Number>} 
     */
    ButtonCooldowns: new Collection(),

    /** Holds all Cooldowns for Select Menu Interactions, mapped by "selectName_userID"
     * @type {Collection<String, Number>}
     */
    SelectCooldowns: new Collection()
};




/** RegEx for Role Mentions */
export const RoleMentionRegEx = new RegExp(/<@&(\d{17,20})>/g);

/** RegEx for Discord Custom Emoji */
export const DiscordEmojiRegex = new RegExp(/<a?:(?<name>[a-zA-Z0-9\_]+):(?<id>\d{15,21})>/);

/** RegEx for Hex Colour Codes */
export const HexColourRegex = new RegExp(/#[0-9a-fA-F]{6}/);



/** System Message types */
export const SystemMessageTypes = [
    MessageType.RecipientAdd, MessageType.RecipientRemove, MessageType.Call, MessageType.ChannelNameChange,
    MessageType.ChannelIconChange, MessageType.ChannelPinnedMessage, MessageType.UserJoin, MessageType.GuildBoost,
    MessageType.GuildBoostTier1, MessageType.GuildBoostTier2, MessageType.GuildBoostTier3, MessageType.ChannelFollowAdd,
    MessageType.GuildDiscoveryDisqualified, MessageType.GuildDiscoveryRequalified, MessageType.GuildDiscoveryGracePeriodInitialWarning,
    MessageType.GuildDiscoveryGracePeriodFinalWarning, MessageType.ThreadCreated, MessageType.GuildInviteReminder, MessageType.AutoModerationAction,
    MessageType.RoleSubscriptionPurchase, MessageType.InteractionPremiumUpsell, MessageType.StageStart, MessageType.StageEnd, MessageType.StageSpeaker,
    MessageType.StageRaiseHand, MessageType.StageTopic, MessageType.GuildApplicationPremiumSubscription, MessageType.GuildIncidentAlertModeEnabled,
    MessageType.GuildIncidentAlertModeDisabled, MessageType.GuildIncidentReportRaid, MessageType.GuildIncidentReportFalseAlarm,
    MessageType.PurchaseNotification, MessageType.PollResult,
    // Not added to D-API-Types yet, or was deprecated/deleted (but keeping in here just in case)
    13, // GUILD_STREAM - Sent when a User starts a screenshare in a Server VC (deprecated/scrapped)
    33, // PRIVATE_CHANNEL_INTEGRATION_ADDED - For adding Bots to a GroupDM (Deprecated/scrapped in favour of Interaction Contexts)
    34, // PRIVATE_CHANNEL_INTEGRATION_REMOVED - For removing Bots from a GroupDM (Deprecated/scrapped in favour of Interaction Contexts)
    35, // PREMIUM_REFERRAL - Sent when a User gifts a Nitro referral (Not added to D-API-Types)
    40, // GUILD_DEADCHAT_REVIVE_PROMPT - Sent as a system message when no one has spoken in the current channel for ~1 hour. (scrapped experiment)
    41, // CUSTOM_GIFT - When a user buys another user a gift (Not added to D-API-Types)
    42, // GUILD_GAMING_STATS_PROMPT - Possibly sent when a user shares their gaming stats for a game. (scrapped experiment)
    43, // POLL - Deprecated in favour of <Message>.poll I believe?
    45, // VOICE_HANGOUT_INVITE - User invites another user to hangout in a Server voice channel. (scrapped)
    47, // CHANGELOG - System DMs for Discord Changelogs (Used only TWICE before being scrapped due to r/discordapp complaints. Zebby liked having Discord Changelogs in System DMs, but whatever...)
    48, // NITRO_NOTIFICATION - Sent when a Nitro promotion is triggered
    49, // CHANNEL_LINKED_TO_LOBBY - Sent when a Server Channel is linked to a game lobby via the SocialSDK
    50, // GIFTING_PROMPT - Ephemeral message to prompt Users to sent a Gift/GIF to a friend (Part of the Friendship Anniversary Experiment)
    51, // IN_GAME_MESSAGE_NUX - A local-only message sent when a User receives an in-game message via the SocialSDK
    52, // GUILD_JOIN_REQUEST_ACCEPT_NOTIFICATION - Pending server member application was approved (Not yet added to D-API-Types, part of Server Membership Applications)
    53, // GUILD_JOIN_REQUEST_REJECT_NOTIFICATION - Pending server member application was rejected (Not yet added to D-API-Types, part of Server Membership Applications)
    54, // GUILD_JOIN_REQUEST_WITHDRAWN_NOTIFICATION - Pending server member application was withdrawn by said member (Not yet added to D-API-Types, part of Server Membership Applications)
    55, // HD_STREAMING_UPGRADED - Sent when a User upgrades a Server VC to HD-streaming for 24 hours (Part of the HD Splash Potion Experiment, which has been scrapped)
    56, // CHAT_WALLPAPER_SET - Sent when a User sets a (G)DM chat wallpaper. (scrapped experiment)
    57, // CHAT_WALLPAPER_REMOVE - Sent when a User removes a set (G)DM chat wallpaper. (scrapped experiment)
    58, // REPORT_TO_MOD_DELETED_MESSAGE - A Server Mod Report was resolved via deleting the reported message (VERY limited experiment)
    59, // REPORT_TO_MOD_TIMEOUT_USER - A Server Mod Report was resolved via timing out the reported user (VERY limited experiment)
    60, // REPORT_TO_MOD_KICK_USER - A Server Mod Report was resolved via kicking the reported user from the Server (VERY limited experiment)
    61, // REPORT_TO_MOD_BAN_USER - A Server Mod Report was resolved via banning the reported user from the Server (VERY limited experiment)
    62, // REPORT_TO_MOD_CLOSED_REPORT - A Server Mod Report was resolved via closing the report with no further action (VERY limited experiment)
    63, // EMOJI_ADDED - System Channel message sent when a new Custom Emoji is added to the Server. (scrapped experiment)
];



/** Default request headers for Discord API requests */
export const DefaultDiscordRequestHeaders = {
    'content-type': 'application/json',
    Authorization: `Bot ${DISCORD_TOKEN}`,
}





/** Endpoint for sending Messages (outside of Interactions)
 * @param channelId ID of the Channel to create a new Message in
 * 
 * @note Uses POST Calls
 */
export const CreateMessageEndpoint = (channelId) => `https://discord.com/api/v10/channels/${channelId}/messages`;

/** Endpoint for editing Messages (outside of Interactions)
 * @param channelId ID of the Channel the Message is in
 * @param messageId ID of the Message to edit
 * 
 * @note Use PATCH to edit - DELETE to delete
 */
export const ManageMessageEndpoint = (channelId, messageId) => `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`;

/** Endpoint for creating Interaction Responses
 * @param interactionId {String} ID of the Interaction to respond to
 * @param interactionToken {String} Token of the Interaction to respond to
 * 
 * @note Uses POST Calls
 */
export const CreateInteractionResponseEndpoint = (interactionId, interactionToken) => `https://discord.com/api/v10/interactions/${interactionId}/${interactionToken}/callback`;

/** Endpoint for getting, editing, or deleting ORIGINAL Interaction Responses
 * @param applicationId {String} ID of the Application that sent the Interaction Response
 * @param interactionToken {String} Token of the Interaction to get/edit/delete its Response of
 * 
 * @note Use GET to fetch - PATCH to edit - DELETE to delete
 */
export const OriginalInteractionResponseEndpoint = (applicationId, interactionToken) => `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}/messages/@original`;

/** Endpoint for creating a Followup Response to an Interaction
 * @param applicationId {String} ID of the Application to send a Followup Response for
 * @param interactionToken {String} Token of the original Interaction to followup
 * 
 * @note Uses POST Calls
 */
export const CreateInteractionFollowupEndpoint = (applicationId, interactionToken) => `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}`;
