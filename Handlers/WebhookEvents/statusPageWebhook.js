import { JsonResponse } from "../../Utility/utilityMethods";


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
 * @property {String} resolved_at Stringified Timestamp, in YYYY-MM-DDTHH:MM:SSZ format
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


    // ACK Webhook event
    return new Response(null, { status: 204 });
}
