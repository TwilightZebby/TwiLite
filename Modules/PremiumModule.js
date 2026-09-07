import { DefaultDiscordRequestHeaders } from "../Utility/utilityConstants.js";



/**
 * Handles disabling & removing Premium-only features for a Guild that has lost its Inferno subscription
 * 
 * @param {String} guildId 
 * @param {*} cfEnv
 */
export async function handleExpiredInfernoCleanUp(guildId, cfEnv) {
    // Remove set Custom Branding
    let requestUpdateCurrentMember = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/@me`, {
        method: 'PATCH',
        headers: DefaultDiscordRequestHeaders,
        body: JSON.stringify({
            "avatar": null,
            "banner": null,
            "bio": null
        })
    });


    // Disable Twitch Notification Module
    let queryUpdateTwitchNotifications = await cfEnv.DATABASE
        .prepare("UPDATE TwitchNotifications SET is_notification_enabled = 0 WHERE discord_guild_id = ?")
        .bind(guildId)
        .run();


    return;
}
