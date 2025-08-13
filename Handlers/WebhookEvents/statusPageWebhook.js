import { ButtonStyle, ComponentType, MessageFlags, SeparatorSpacingSize } from "discord-api-types/v10";
import { createMongoClient } from "../../Utility/utilityConstants.js";
import { hexToRgb, JsonResponse } from "../../Utility/utilityMethods.js";
import { TWILITE_ADD_APP_URI } from "../../Assets/Hyperlinks.js";


// For typings
/**
 * @typedef {Object} Page
 * @property {String} id
 * @property {String} status_indicator
 * @property {String} status_description
 * @private
 */

/**
 * @typedef {Object} ComponentUpdate
 * @property {String} created_at Stringified Timestamp, in YYYY-MM-DDTHH:MM:SSZ format
 * @property {String} new_status
 * @property {String} old_status
 * @property {String} id
 * @property {String} component_id
 * @private
 */

/**
 * @typedef {Object} Component
 * @property {String} created_at Stringified Timestamp, in YYYY-MM-DDTHH:MM:SSZ format
 * @property {String} id
 * @property {String} name
 * @property {String} status
 * @private
 */

/**
 * @typedef {Object} IncidentComponent
 * @property {String} id
 * @property {String} page_id
 * @property {String} group_id Component Group ID
 * @property {String} created_at Stringified Timestamp, in YYYY-MM-DDTHH:MM:SSZ format
 * @property {String} updated_at Stringified Timestamp, in YYYY-MM-DDTHH:MM:SSZ format
 * @property {Boolean} group Is this component a group
 * @property {String} name Component's Display Name
 * @property {String} description More detailed description for component
 * @property {Number} position Order component appears on StatusPage website
 * @property {'operational'|'under_maintenance'|'degraded_performance'|'partial_outage'|'major_outage'|''} status
 * @property {Boolean} showcase Should component be showcased
 * @property {Boolean} only_show_if_degraded
 * @property {String} automation_email
 * @property {String} start_date Stringified Timestamp, in YYYY-MM-DDTHH:MM:SSZ format
 * @private
 */

/**
 * @typedef {Object} IncidentUpdate
 * @property {String} id
 * @property {String} incident_id
 * @property {Array<Component>} affected_components
 * @property {String} body Incident update body
 * @property {String} created_at Stringified Timestamp, in YYYY-MM-DDTHH:MM:SSZ format
 * @property {String} custom_tweet An optional social media message for incident postmortem
 * @property {Boolean} deliver_notifications
 * @property {String} display_at Stringified Timestamp, in YYYY-MM-DDTHH:MM:SSZ format
 * @property {'investigating'|'identified'|'monitoring'|'resolved'|'scheduled'|'in_progress'|'verifying'|'completed'} status
 * @property {String} updated_at Stringified Timestamp, in YYYY-MM-DDTHH:MM:SSZ format
 * @private
 */

/**
 * @typedef {Object} IncidentImpact
 * @property {String} id
 * @property {String} tenant_id
 * @property {String} atlassian_organization_id
 * @property {String} product_name
 * @property {Array<String>} experiences
 * @property {String} created_at Stringified Timestamp, in YYYY-MM-DDTHH:MM:SSZ format
 */

/**
 * @typedef {Object} Incident
 * @property {String} id
 * @property {Boolean} backfilled
 * @property {Array<IncidentComponent>} components
 * @property {String} created_at Stringified Timestamp, in YYYY-MM-DDTHH:MM:SSZ format
 * @property {'none'|'maintenance'|'minor'|'major'|'critical'} impact
 * @property {'none'|'maintenance'|'minor'|'major'|'critical'} impact_override
 * @property {Array<IncidentUpdate>} incident_updates
 * @property {Array<IncidentImpact>} incident_impacts
 * @property {Object} metadata
 * @property {String} monitoring_at Stringified Timestamp, in YYYY-MM-DDTHH:MM:SSZ format
 * @property {String} name
 * @property {String} page_id
 * @property {String} postmortem_body
 * @property {String} postmortem_body_last_updated_at Stringified Timestamp, in YYYY-MM-DDTHH:MM:SSZ format
 * @property {Boolean} postmortem_ignored If the incident will have a postmortem
 * @property {String} postmortem_published_at Stringified Timestamp, in YYYY-MM-DDTHH:MM:SSZ format
 * @property {String|null} resolved_at Stringified Timestamp, in YYYY-MM-DDTHH:MM:SSZ format, if not null
 * @property {String} scheduled_until Stringified Timestamp, in YYYY-MM-DDTHH:MM:SSZ format
 * @property {String} shortlink Incident shortlink
 * @property {'investigating'|'identified'|'monitoring'|'resolved'|'scheduled'|'im_progress'|'verifying'|'completed'} status
 * @property {String} updated_at Stringified Timestamp, in YYYY-MM-DDTHH:MM:SSZ format
 * @private
 */

/**
 * Typings for received StatusPage Webhook events (excluding the "meta" object)
 * 
 * @typedef {Object} StatusPageWebhook
 * @property {Page} page 
 * @property {ComponentUpdate?} component_update
 * @property {Component?} component
 * @property {Incident} incident
 */


// *******************************
//  Exports

/**
 * Handles StatusPage Webhook events for Discord's Status Page
 * @param {StatusPageWebhook} webhookEvent 
 * 
 * @returns {JsonResponse}
 */
export async function handleStatusPageWebhook(webhookEvent) {
    // StatusPage literally has ZERO documentation on if one should, or the expected way to, verify StatusPage Webhooks.
    // What fun...

    // Create TwiLite DB connection && ensure there's at least one entry so we aren't gonna try to send to no one!
    // Open DB connection
    const MongoDbClient = createMongoClient();
    const TwiliteDb = MongoDbClient.db("main");
    const NotifierCollection = TwiliteDb.collection("outage-notifier");
    const ActiveIncidentsCollection = TwiliteDb.collection("active-outages"); // PURELY because we can't use local caches in CF Workers :c
    const QueryDb = await NotifierCollection.findOne();

    // If none found, return!
    if ( QueryDb == null ) { return new Response(null, { status: 204 }); }

    // There's at least one entry, so do stuff!
    // First, create the message to be posted in Discord chats via the Discord webhooks
    /** @type {import('discord-api-types/v10').APIComponentInContainer[]} */
    let formattedIncidentEntries = [{
        "type": ComponentType.TextDisplay,
        "content": `## Discord Outage - ${webhookEvent.incident.name}\nImpact: ${webhookEvent.incident.impact}`
    }];

    // Just to make this fluffing work because idk if the API is sending as a MAP or as an ARRAY (CloudFlare Worker's logs can't helping)
    let incidentUpdatesArray = Array.from(webhookEvent.incident.incident_updates.values());
    incidentUpdatesArray.reverse(); // Just to have newest at the top

    // Using a FOR loop so I can limit to 5 entries, as not to be a wall of text!
    for ( let i = 0; i < 5; i++ ) {
        let incidentUpdate = incidentUpdatesArray[i];

        // Add formatted update
        let updateDate = new Date(incidentUpdate.updated_at);
        formattedIncidentEntries.push({
            "type": ComponentType.TextDisplay,
            "content": `### ${incidentUpdate.status.charAt(0).toUpperCase() + incidentUpdate.status.slice(1)} ( <t:${Math.floor(updateDate.getTime() / 1000)}:R> )\n${(incidentUpdate.body || "No information available")}`
        });
        // Add divider
        formattedIncidentEntries.push({
            "type": ComponentType.Separator,
            "divider": true,
            "spacing": SeparatorSpacingSize.Small
        });
    }

    // Add footer stuff
    formattedIncidentEntries.push({
        "type": ComponentType.ActionRow,
        "components": [
            {
                "type": ComponentType.Button,
                "style": ButtonStyle.Link,
                "label": `View full status page`,
                "url": webhookEvent.incident.shortlink
            },
            {
                "type": ComponentType.Button,
                "style": ButtonStyle.Link,
                "label": `Posted by TwiLite`,
                "url": TWILITE_ADD_APP_URI
            }
        ]
    });

    /** @type {import('discord-api-types/v10').APIMessageTopLevelComponent[]} */
    const OutageComponents = [{
        "id": 1,
        "type": ComponentType.Container,
        "accent_color": webhookEvent.incident.impact === 'none' ? hexToRgb('#000000') : webhookEvent.incident.impact === 'minor' ? hexToRgb('#13b307') : webhookEvent.incident.impact === 'major' ? hexToRgb('#e8e409') : webhookEvent.incident.impact === 'critical' ? hexToRgb('#940707') : hexToRgb('#004400'),
        "spoiler": false,
        "components": formattedIncidentEntries
    }];


    // Now grab all the Discord webhook data needed to send these messages, or edit if already sent to said webhook
    const CheckForOngoingIncident = await ActiveIncidentsCollection.countDocuments({ incident_id: webhookEvent.incident.id });

    // This is a new incident!
    if ( CheckForOngoingIncident < 1 ) {
        // Grab all the webhooks needed to send the new incident message
        let fetchAllWebhooks = NotifierCollection.find({ type: "DISCORD" });
    
        for await ( const webhookDocument of fetchAllWebhooks ) {
            // Attempt to send message
            let webhookExecute = await fetch(`https://discord.com/api/v10/webhooks/${webhookDocument.webhook_id}/${webhookDocument.webhook_token}?with_components=true&wait=true${webhookDocument.in_thread === true ? `&thread_id=${webhookDocument.thread_id}` : ''}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bot ${DISCORD_TOKEN}`
                },
                method: 'POST',
                body: JSON.stringify({
                    flags: MessageFlags.IsComponentsV2,
                    components: OutageComponents
                })
            });
            let responseBody = await webhookExecute.json();

            if ( webhookExecute.status === 204 || webhookExecute.status === 200 ) {
                // Successful send, save for editing later
                await ActiveIncidentsCollection.insertOne({ incident_id: webhookEvent.incident.id, guild_id: webhookDocument.guild_id, message_id: responseBody["id"], webhook_id: webhookDocument.webhook_id, webhook_token: webhookDocument.webhook_token, in_thread: webhookDocument.in_thread, thread_id: webhookDocument.thread_id });
            }
            else {
                // Error was thrown
                console.log(`[OUTAGE NOTIFIER] - Error sending new Outage Message via Discord Webhook. ${webhookExecute.status} ${webhookExecute.statusText} - ${JSON.stringify(responseBody)}`);
            }

            break;
        }

    }
    // This is an update to an existing incident
    else {
        // First, attempt to edit existing messages via the webhooks
        let fetchSentMessageIds = ActiveIncidentsCollection.find({ incident_id: webhookEvent.incident.id });
    
        for await ( const webhookDocument of fetchSentMessageIds ) {
            // Attempt to edit message
            let webhookExecute = await fetch(`https://discord.com/api/v10/webhooks/${webhookDocument.webhook_id}/${webhookDocument.webhook_token}?with_components=true${webhookDocument.in_thread === true ? `&thread_id=${webhookDocument.thread_id}` : ''}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bot ${DISCORD_TOKEN}`
                },
                method: 'POST',
                body: JSON.stringify({
                    flags: MessageFlags.IsComponentsV2,
                    components: OutageComponents
                })
            });
            let responseBody = await webhookExecute.json();

            if ( webhookExecute.status === 204 || webhookExecute.status === 200 ) {
                // Successful edit, now check if we need to delete due to incident being resolved
                if ( webhookEvent.incident.resolved_at != null ) {
                    // Delete from DB due to being resolved!
                    await ActiveIncidentsCollection.deleteMany({ incident_id: webhookEvent.incident.id });
                }
            }
            else {
                // Error was thrown
                console.log(`[OUTAGE NOTIFIER] - Error editing updated Outage Message via Discord Webhook. ${webhookExecute.status} ${webhookExecute.statusText} - ${JSON.stringify(responseBody)}`);
            }

            break;
        }
    }


    // ACK Webhook event
    return new Response(null, { status: 204 });
}
