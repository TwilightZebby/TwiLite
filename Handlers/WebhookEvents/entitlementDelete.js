import { handleExpiredInfernoCleanUp } from '../../Modules/PremiumModule.js';
import { JsonResponse } from '../../Utility/utilityMethods.js';


// *******************************
//  Exports

/**
 * Handles ENTITLEMENT_DELETE Webhook Events
 * @param {import('discord-api-types/v10').APIWebhookEvent} webhookEvent 
 * 
 * @returns {JsonResponse}
 */
export async function handleEntitlementDelete(webhookEvent) {
    // Grab entitlement & check to see if it has expired
    /** @type {import('discord-api-types/v10').APIEntitlement} */
    let eventData = webhookEvent.event.data;

    if ( (eventData.deleted === true) || (eventData.ends_at != null && (new Date(eventData.ends_at).getTime() < Date.now())) ) {
        // Entitlement has expired.

        await handleExpiredInfernoCleanUp(eventData.guild_id);
    }

    // ACK Webhook Event
    return new Response(null, { status: 204 });
}
