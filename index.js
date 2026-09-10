import { ApplicationWebhookEventType, ApplicationWebhookType, InteractionResponseType, InteractionType } from 'discord-api-types/v10';
import { isChatInputApplicationCommandInteraction, isContextMenuApplicationCommandInteraction, isMessageComponentButtonInteraction, isMessageComponentSelectMenuInteraction } from 'discord-api-types/utils';
import { AutoRouter } from 'itty-router';
import { verifyKey } from 'discord-interactions';

import { handleSlashCommand } from './Handlers/Commands/slashCommandHandler.js';
import { handleContextCommand } from './Handlers/Commands/contextCommandHandler.js';
import { handleButton } from './Handlers/Interactions/buttonHandler.js';
import { handleSelect } from './Handlers/Interactions/selectHandler.js';
import { handleAutocomplete } from './Handlers/Interactions/autocompleteHandler.js';
import { handleModal } from './Handlers/Interactions/modalHandler.js';
import { handleAppAuthorized } from './Handlers/WebhookEvents/applicationAuthorized.js';
import { handleAppDeauthorized } from './Handlers/WebhookEvents/applicationDeauthorized.js';
import { handleEntitlementCreate } from './Handlers/WebhookEvents/entitlementCreate.js';
import { handleEntitlementUpdate } from './Handlers/WebhookEvents/entitlementUpdate.js';
import { handleEntitlementDelete } from './Handlers/WebhookEvents/entitlementDelete.js';
import { DISCORD_APP_PUBLIC_KEY, DISCORD_APP_USER_ID, RANDOMLY_GENERATED_FIXED_STRING } from './config.js';
import { JsonResponse, verifyTwitchRequest } from './Utility/utilityMethods.js';
import { getTwitchApiClient } from './Utility/utilityConstants.js';
import { processStreamOnlineEvents } from './Modules/Notifications/TwitchNotifications.js';









// *******************************
async function scheduledCronTask(controller, env, ctx) {

    // ****** If there are any Twitch Dedup Data that's older than 30 minutes, delete it!
    const TimeNow = Date.now();
    const Time30MinutesAgo = TimeNow - 1.8e+6;

    let queryTwitchDups = await env.DATABASE
        .prepare("SELECT * FROM TwitchDeduplication WHERE message_timestamp_unix <= ? LIMIT 1")
        .bind(Time30MinutesAgo)
        .run();

    if ( queryTwitchDups.results != null && queryTwitchDups.results.length > 0 ) {
        let { success } = await env.DATABASE
            .prepare("DELETE FROM TwitchDeduplication WHERE message_timestamp_unix <= ?")
            .bind(Time30MinutesAgo)
            .run();
    }

    
    return;
}








// *******************************
// Create Router
const router = AutoRouter();


/** Wave to verify CF worker is working */
router.get('/', (request, env) => {
    return new Response(`👏 ${DISCORD_APP_USER_ID}`);
});








// *******************************
// For receiving Twitch's Webhook Events
const TWITCH_MESSAGE_ID = 'Twitch-Eventsub-Message-Id';
const TWITCH_MESSAGE_TIMESTAMP = 'Twitch-Eventsub-Message-Timestamp';
const TWITCH_MESSAGE_SIGNATURE = 'Twitch-Eventsub-Message-Signature';
const TWITCH_MESSAGE_TYPE = 'Twitch-Eventsub-Message-Type';
const HMAC_PREFIX = 'sha256=';

router.post('/twitch-webhooks', async (request, env) => {
    // Clone request (to not affect original)
    const ClonedRequest = request.clone();

    // Verify request
    const MessageId = request.headers.get(TWITCH_MESSAGE_ID);
    const MessageTimestamp = request.headers.get(TWITCH_MESSAGE_TIMESTAMP);
    const MessageSignature = request.headers.get(TWITCH_MESSAGE_SIGNATURE);
    const RequestBody = await request.text();

    const isValid = await verifyTwitchRequest(MessageId, MessageTimestamp, MessageSignature, RequestBody, RANDOMLY_GENERATED_FIXED_STRING);

    if ( !isValid ) {
        return new Response('Unauthorized', { status: 403 });
    }

    let eventBody = await ClonedRequest.json();
    
    // Response for Challenge Requests
    if ( request.headers.get(TWITCH_MESSAGE_TYPE) === 'webhook_callback_verification' ) {
        return new Response(`${eventBody.challenge}`, { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    
    // Guard against replay attacks or Twitch sending the same event multiple times
    let headerMessageId = request.headers.get(TWITCH_MESSAGE_ID);
    let headerMessageTimestamp = request.headers.get(TWITCH_MESSAGE_TIMESTAMP);

    // Check timestamp. If older than 10 minutes, exit early here
    let receivedTime = (new Date(headerMessageTimestamp)).getTime();
    let timeNow = Date.now();

    if ( (timeNow - receivedTime) >= 600000 ) {
        return new Response(null, { status: 204 });
    }


    // Now check for duplicated events
    const QueryTwitchDedup = await env.DATABASE
        .prepare("SELECT * FROM TwitchDeduplication WHERE message_id = ? LIMIT 1")
        .bind(headerMessageId)
        .run();
    /** @type {?Array<import('./Modules/Notifications/TwitchNotifications.js').SchemaTwitchDeduplicationData>} */
    const TwitchDedupResults = QueryTwitchDedup.results;
    const TwitchMessageTimestampUnix = new Date(headerMessageTimestamp).getTime();

    if ( TwitchDedupResults == null || TwitchDedupResults.length === 0 ) {
        // This event hasn't been sent until now. Thus, temp-save it to prevent event duplication, then continue processing
        const { success } = await env.DATABASE
            .prepare("INSERT INTO TwitchDeduplication ('message_id', 'message_timestamp_iso', 'message_timestamp_unix') VALUES (?, ?, ?)")
            .bind(headerMessageId, headerMessageTimestamp, TwitchMessageTimestampUnix)
            .run();
    }
    else {
        // This HAS been sent already beforehand, so ignore this duplicated request
        return new Response(null, { status: 204 });
    }

    const TwitchApiClient = getTwitchApiClient();



    // ******* STREAM UP/ONLINE NOTIFICATION
    if ( eventBody["subscription"]["type"] === "stream.online" ) {
        // Force-pause for 60 seconds so that we can be EXTRA SURE that Twitch's API does update to reflect there is a stream going on now
        await scheduler.wait(60000);

        // Grab data needed
        /** @type {import('./Modules/Notifications/TwitchNotifications.js').TwitchStreamUpEventSubData} */
        let streamUpData = eventBody["event"];
        let fetchedStreamData = await TwitchApiClient.streams.getStreamByUserId(streamUpData.broadcaster_user_id);

        if ( fetchedStreamData == null ) {
            // Since this is being run on a CF Worker, we don't get a lot of time in order to do stuff.
            //   As such, I cannot do a "loop with few minutes pause between each cycle for 5 cycles in order to wait for Twitch's API to cache it" thing here
            //console.log(`No Twitch Stream Data found for ${streamUpData.broadcaster_user_name}`);
            return new Response(null, { status: 204 });
        }

        let fetchedGameData = await TwitchApiClient.games.getGameById(fetchedStreamData.gameId);
        /** @type {{results: Array<import('./Modules/Notifications/TwitchNotifications.js').SchemaTwitchGoLiveNotifications>}} */
        const { results } = await env.DATABASE
            .prepare("SELECT * FROM TwitchNotifications WHERE twitch_channel_id = ?")
            .bind(streamUpData.broadcaster_user_id)
            .run();

        // Now process the Twitch Notifications for the Discord Guilds that are expecting this Streamer's notifications
        for ( const notifConfig of results ) {
            // Make sure it's actually enabled first as well
            if ( notifConfig.is_notification_enabled === 1 && notifConfig.twitch_channel_id === streamUpData.broadcaster_user_id ) {
                await processStreamOnlineEvents(streamUpData, fetchedStreamData, fetchedGameData, notifConfig, env)
            }
        }
    }


    // ACK to Twitch
    return new Response(null, { status: 204 });
});










// *******************************
/** Main route for all requests sent from Discord. They will include a JSON payload */
router.post('/', async (request, env) => {
    // Verify request
    const { isValid, interaction, cfEnv } = await server.verifyDiscordRequest(request, env);
    
    if ( !isValid || !interaction ) {
        return new Response('Bad request signature.', { status: 401 });
    }


    // Handle PING Interaction
    if ( interaction.type === InteractionType.Ping ) {
        return new JsonResponse({ type: InteractionResponseType.Pong });
    }

    // Now split off & handle each Interaction type
    if ( isChatInputApplicationCommandInteraction(interaction) ) {
        return await handleSlashCommand(interaction, cfEnv);
    }
    else if ( isContextMenuApplicationCommandInteraction(interaction) ) {
        return await handleContextCommand(interaction, cfEnv);
    }
    else if ( isMessageComponentButtonInteraction(interaction) ) {
        return await handleButton(interaction, cfEnv);
    }
    else if ( isMessageComponentSelectMenuInteraction(interaction) ) {
        return await handleSelect(interaction, cfEnv);
    }
    else if ( interaction.type === InteractionType.ApplicationCommandAutocomplete ) {
        return await handleAutocomplete(interaction);
    }
    else if ( interaction.type === InteractionType.ModalSubmit ) {
        return await handleModal(interaction, cfEnv);
    }
    else {
        console.info(`****Unrecognised or new unhandled Interaction Type triggered: ${interaction.type}`);
        return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
    }
});









// *******************************
/** For incoming Webhook Events from Discord. They may include a JSON payload */
router.post('/webhook', async (request, env) => {
    // Verify request
    const { isValid, interaction, cfEnv } = await server.verifyDiscordRequest(request, env);
    
    if ( !isValid || !interaction ) {
        return new Response('Bad request signature.', { status: 401 });
    }


    // Handle PING Event
    if ( interaction.type === ApplicationWebhookType.Ping ) {
        return new Response(null, { status: 204 });
    }
    
    // Handle Webhook Events
    /** @type {import('discord-api-types/v10').APIWebhookEvent} */
    const WebhookEvent = interaction;
    
    // APPLICATION_AUTHORIZED Event
    if ( WebhookEvent.event.type === ApplicationWebhookEventType.ApplicationAuthorized ) {
        return await handleAppAuthorized(WebhookEvent);
    }
    // APPLICATION_DEAUTHORIZED Event
    else if ( WebhookEvent.event.type === ApplicationWebhookEventType.ApplicationDeauthorized ) {
        return await handleAppDeauthorized(WebhookEvent);
    }
    // ENTITLEMENT_CREATE Event
    else if ( WebhookEvent.event.type === ApplicationWebhookEventType.EntitlementCreate ) {
        return await handleEntitlementCreate(WebhookEvent);
    }
    // ENTITLEMENT_UPDATE Event
    else if ( WebhookEvent.event.type === ApplicationWebhookEventType.EntitlementUpdate ) {
        return await handleEntitlementUpdate(WebhookEvent, cfEnv);
    }
    // ENTITLEMENT_DELETE Event
    else if ( WebhookEvent.event.type === ApplicationWebhookEventType.EntitlementDelete ) {
        return await handleEntitlementDelete(WebhookEvent, cfEnv);
    }
    // Just in case
    else {
        return new Response(null, { status: 204 });
    }
});









// *******************************
router.get('*', () => {
    return rejectCuntsWhoShouldntBeMakingRequestsToMyCfWorker();
});

/**
 * I noticed there's been a *lot* of random requests made to my CF Workers, to endpoints I don't even *have* on my CF Worker.
 * So, having to add this to tell them to FUCK OFF (tell your unethical generative AIs to leave my CF Workers alone)
 */
function rejectCuntsWhoShouldntBeMakingRequestsToMyCfWorker() {
    return new Response(`Unethical generative AIs, this is where you should be going:`, { status: 308, headers: { "Location": `https://github.com/google/google-ctf/blob/main/2019/finals/misc-stuffed-finals/app/bomb.br` } });
}









// *******************************
async function verifyDiscordRequest(request, env) {
    const signature = request.headers.get('x-signature-ed25519');
    const timestamp = request.headers.get('x-signature-timestamp');
    const body = await request.text();
    const isValidRequest =
      signature &&
      timestamp &&
      (await verifyKey(body, signature, timestamp, DISCORD_APP_PUBLIC_KEY));
    if (!isValidRequest) {
      return { isValid: false };
    }
  
    return { interaction: JSON.parse(body), isValid: true, cfEnv: env };
}
  
const server = {
    verifyDiscordRequest,
    fetch: router.fetch,
    scheduled: scheduledCronTask
};

export default server;
