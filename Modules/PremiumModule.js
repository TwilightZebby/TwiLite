import { DefaultDiscordRequestHeaders } from "../Utility/utilityConstants.js";



/**
 * Handles disabling & removing Premium-only features for a Guild that has lost its Inferno subscription
 * 
 * @param {String} guildId 
 */
export async function handleExpiredInfernoCleanUp(guildId) {
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


    return;
}
