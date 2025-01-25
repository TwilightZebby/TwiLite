import { JsonResponse } from '../../Utility/utilityMethods.js';
import { DISCORD_APP_USER_ID, DISCORD_TOKEN, LOG_WEBHOOK_ID, LOG_WEBHOOK_TOKEN } from '../../config.js';


// *******************************
//  Exports

/**
 * Handles APPLICATION_AUTHORIZED Webhook Events
 * @param {import('discord-api-types/v10').APIWebhookEvent} webhookEvent 
 * 
 * @returns {JsonResponse}
 */
export async function handleAppAuthorized(webhookEvent) {
    // Format into a message
    /** @type {'Server'|'User'} */
    let appType = webhookEvent.event.data.integration_type === 0 ? `Server` : `User`;
    /** @type {import('discord-api-types/v10').APIUser} */
    let authedUser = webhookEvent.event.data.user;
    let authedScopes = webhookEvent.event.data.scopes;
    /** @type {import('discord-api-types/v10').APIGuild | undefined} */
    let authedGuild = webhookEvent.event.data.guild;

    // Fetch App's install count
    let fetchedApp = await fetch(`https://discord.com/api/v10/applications/${DISCORD_APP_USER_ID}`, {
        method: 'GET',
        headers: {
            Authorization: `Bot ${DISCORD_TOKEN}`
        }
    });
    let appData = await fetchedApp.json();
    let guildInstallCount = appData["approximate_guild_count"];
    let userInstallCount = appData["approximate_user_install_count"];

    let newAuthMessage = `## 📈 New Authorisation\nAdded as a **${appType} App** by **${authedUser.global_name != null ? authedUser.global_name : authedUser.username}** ( <@${authedUser.id}> ) ${appType === 'Server' ? `to the **${authedGuild?.name}** Server (ID: ${authedGuild?.id})` : ''}.\nScopes authorised for: ${authedScopes.join(' && ')}\nNew total Guild Install Count: ${guildInstallCount}\nNew total User Install Count: ${userInstallCount}`;

    // Send to Logger Webhook
    await fetch(`https://discord.com/api/v10/webhooks/${LOG_WEBHOOK_ID}/${LOG_WEBHOOK_TOKEN}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot ${DISCORD_TOKEN}`
        },
        body: JSON.stringify({ content: newAuthMessage, allowed_mentions: { parse: [] } })
    });

    // ACK Webhook Event
    return new Response(null, { status: 204 });
}
