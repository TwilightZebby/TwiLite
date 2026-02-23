import { DISCORD_APP_USER_ID, SKU_TIP_JAR_ID } from '../../config.js';
import { DefaultDiscordRequestHeaders } from '../../Utility/utilityConstants.js';
import { JsonResponse } from '../../Utility/utilityMethods.js';


// *******************************
//  Exports

/**
 * Handles ENTITLEMENT_CREATE Webhook Events
 * @param {import('discord-api-types/v10').APIWebhookEvent} webhookEvent 
 * 
 * @returns {JsonResponse}
 */
export async function handleEntitlementCreate(webhookEvent) {
    // Grab entitlement & check to see if it is the Tip Jar one
    /** @type {import('discord-api-types/v10').APIEntitlement} */
    let eventData = webhookEvent.event.data;

    if ( eventData.sku_id === SKU_TIP_JAR_ID ) {
        // This is a new Tip Jar consumable, as such 'consume' the entitlement so that this SKU can be brought again

        let consumeEntitlementRequest = await fetch(`https://discord.com/api/v10/applications/${DISCORD_APP_USER_ID}/entitlements/${eventData.id}/consume`, {
            method: 'POST',
            headers: DefaultDiscordRequestHeaders
        });
    }

    // ACK Webhook Event
    return new Response(null, { status: 204 });
}
