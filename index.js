import { ApplicationWebhookEventType, ApplicationWebhookType, ButtonStyle, ComponentType, InteractionResponseType, InteractionType, MessageFlags } from 'discord-api-types/v10';
import { isChatInputApplicationCommandInteraction, isContextMenuApplicationCommandInteraction, isMessageComponentButtonInteraction, isMessageComponentSelectMenuInteraction } from 'discord-api-types/utils';
import { AutoRouter } from 'itty-router';
import { verifyKey } from 'discord-interactions';
import * as crypto from 'crypto'; // THIS IS SECURITY CRYPTO NOT YUCKY BLOCKCHAIN CRYPTOCURRENCIES 💀

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
import { CLOUDFLARE_ID, CLOUDFLARE_KV_ID, DISCORD_APP_PUBLIC_KEY, DISCORD_APP_USER_ID, RANDOMLY_GENERATED_FIXED_STRING } from './config.js';
import { JsonResponse } from './Utility/utilityMethods.js';
import { TwitchHttpListener } from './Utility/utilityConstants.js';
import { processStreamOnlineEvents } from './Modules/Notifications/TwitchNotifications.js';









// *******************************
// Create Router
const router = AutoRouter();


/** Wave to verify CF worker is working */
router.get('/', (request, env) => {
    return new Response(`👏 ${DISCORD_APP_USER_ID}`);
});









// *******************************
// Setup Twitch Event Listener
TwitchHttpListener.start();








// *******************************
// For receiving Twitch's Webhook Events
const TWITCH_MESSAGE_ID = 'twitch-eventsub-message-id';
const TWITCH_MESSAGE_TIMESTAMP = 'twitch-eventsub-message-timestamp';
const TWITCH_MESSAGE_SIGNATURE = 'twitch-eventsub-message-signature';
const TWITCH_MESSAGE_TYPE = 'twitch-eventsub-message-type';
const HMAC_PREFIX = 'sha256=';

router.post('/twitch-webhooks', async (request, env) => {
    // Response for Challenge Requests
    if ( request.headers.get(TWITCH_MESSAGE_TYPE) === 'webhook_callback_verification' ) {
        console.log(`Twitch validation request made`);
        let eventBody = await request.json();
        return new Response(`${eventBody.challenge}`, { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    // Verify request
    const { eventData, isValid, cfEnv } = verifyTwitchRequest(request, env);

    if ( !isValid || !eventData ) {
        console.log(`Invalid request for Twitch Module`);
        return new Response(null, { status: 403 });
    }

    // Placeholder for now while I rework the whole adding/removing system
    console.log(`Twitch Webhook Event handled.`);
    let testData = JSON.stringify(eventData);
    console.log(testData);
    return new Response(null, { status: 204 });
});


//   Note: This was my first attempt at doing processing of Twitch Webhook Events, before I realised I was doing it wrong! Will be replaced next!
/* * @type {import('./Modules/Notifications/TwitchNotifications.js').TwitchNotificationConfig[] */
/* let requestAllTwitchNotifications = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ID}/storage/kv/namespaces/${CLOUDFLARE_KV_ID}/values/twitchNotifications`);


requestAllTwitchNotifications.forEach(notifConfig => {
    notifConfig.TwitchGoLiveConfig.forEach(goLiveConfig => {
        
        // ******* TWITCH - ON STREAM ONLINE (channel goes live)
        // Make sure it's actually enabled first
        if ( goLiveConfig.IsNotificationEnabled ) {
            TwitchHttpListener.onStreamOnline(goLiveConfig.TwitchChannelId, async eventData => {
                console.log(`${eventData.broadcasterDisplayName} just went live!`);

                //await processStreamOnlineEvents(eventData, goLiveConfig);
                return;
            });
        }


    });
}); */










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
        return await handleEntitlementUpdate(WebhookEvent);
    }
    // ENTITLEMENT_DELETE Event
    else if ( WebhookEvent.event.type === ApplicationWebhookEventType.EntitlementDelete ) {
        return await handleEntitlementDelete(WebhookEvent);
    }
    // Just in case
    else {
        return new Response(null, { status: 204 });
    }
});






router.all('*', () => {
    //new Response('Not Found.', { status: 400 })
    return rejectCuntsWhoShouldntBeMakingRequestsToMyCfWorker();
});









// *******************************
/**
 * I noticed there's been a *lot* of random requests made to my CF Workers, to endpoints I don't even *have* on my CF Worker.
 * So, having to add this to tell them to FUCK OFF (tell your unethical generative AIs to leave my CF Workers alone)
 */
function rejectCuntsWhoShouldntBeMakingRequestsToMyCfWorker() {
    return Response(`Unethical generative AIs, this is where you should be going:`, { status: 308, headers: { "Location": `https://github.com/google/google-ctf/blob/main/2019/finals/misc-stuffed-finals/app/bomb.br` } });
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

function verifyTwitchRequest(request, env) {
    let twitchMessage = getHmacMessage(request);
    let hmac = HMAC_PREFIX + getHmac(RANDOMLY_GENERATED_FIXED_STRING, twitchMessage);

    if ( true === verifyTwitchMessage(hmac, request.headers.get(TWITCH_MESSAGE_SIGNATURE)) ) {
        let twitchNotification = JSON.parse(request.body);

        return { eventData: twitchMessage, isValid: true, cfEnv: env };
    }
    else {
        return { isValid: false };
    }
}

/**
 * Builds message used to get HMAC for Twitch Webhook Events
 * 
 * @param {IRequest} request 
 * @private
 */
function getHmacMessage(request) {
    return (request.headers.get(TWITCH_MESSAGE_ID) +
        request.headers.get(TWITCH_MESSAGE_TIMESTAMP) +
        request.body);
}

/**
 * Gets the HMAC for Twitch Webhook Events
 * 
 * @param {String} secret 
 * @param {*} message 
 * @private
 */
function getHmac(secret, message) {
    return crypto.createHmac('sha256', secret)
        .update(message)
        .digest('hex');
}

/**
 * Verifies our signature matches Twitch's signature
 * 
 * @param {String} hmac 
 * @param {*} verifySignature 
 * @private
 */
function verifyTwitchMessage(hmac, verifySignature) {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(verifySignature));
}
  
const server = {
    verifyDiscordRequest,
    verifyTwitchRequest,
    fetch: router.fetch,
};

export default server;
