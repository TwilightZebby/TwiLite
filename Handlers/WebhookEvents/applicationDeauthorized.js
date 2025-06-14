import { JsonResponse } from '../../Utility/utilityMethods.js';
import { DISCORD_APP_USER_ID, DISCORD_TOKEN, LOG_WEBHOOK_ID, LOG_WEBHOOK_TOKEN } from '../../config.js';


// *******************************
//  Exports

/**
 * Handles APPLICATION_DEAUTHORIZED Webhook Events
 * @param {import('discord-api-types/v10').APIWebhookEvent} webhookEvent 
 * 
 * @returns {JsonResponse}
 */
export async function handleAppDeauthorized(webhookEvent) {
    // For some reason, Discord decided NOT to include GUILD-based deauth's, and only USER-based deauth's, for this event. Why? I have no idea. :c
    
    // Format into a message
    /** @type {import('discord-api-types/v10').APIUser} */
    let DeauthedUser = webhookEvent.event.data.user;

    // Fetch App's install count
    let fetchedApp = await fetch(`https://discord.com/api/v10/applications/${DISCORD_APP_USER_ID}`, {
        method: 'GET',
        headers: {
            Authorization: `Bot ${DISCORD_TOKEN}`
        }
    });
    let appData = await fetchedApp.json();
    let userInstallCount = appData["approximate_user_install_count"];
    let userAuthCount = appData["approximate_user_authorization_count"];

    let newAuthMessage = `## :chart_with_downwards_trend: Deauthorisation\nRemoved as a **User App** by **${DeauthedUser.global_name != null ? DeauthedUser.global_name : DeauthedUser.username}** ( <@${DeauthedUser.id}> ).\nNew total User Install Count: ${userInstallCount}\nNew total User Authorisation Count: ${userAuthCount}\n-# User Installs are with \`application.commands\` Scope. User Auths are via OAuth2.`;

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
