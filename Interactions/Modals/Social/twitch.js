import { ChannelType, ComponentType, InteractionResponseType, MessageFlags, PermissionFlagsBits } from 'discord-api-types/v10';
import { checkForPermissionInChannel, getTwitchAccessToken, JsonResponse } from '../../../Utility/utilityMethods.js';
import { getMongoClient, TwitchApiClient } from '../../../Utility/utilityConstants.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { listTwitchNotifications } from '../../../Modules/Notifications/TwitchNotifications.js';
import { CF_WORKER_URL, RANDOMLY_GENERATED_FIXED_STRING, TWITCH_CLIENT_ID } from '../../../config.js';


export const Modal = {
    /** The Modals's name - set as the START of the Modal's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "modalName_extraData"
     * @type {String}
     */
    name: "twitch",

    /** Modal's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles management of Twitch Notifications",

    /** Runs the Modal
     * @param {import('discord-api-types/v10').APIModalSubmitGuildInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     * @param {*} cfEnv 
     */
    async executeModal(interaction, interactionUser, cfEnv) {
        // Grab action from custom ID
        const ModalComponents = interaction.data.components;
        const SplitCustomId = interaction.data.custom_id.split("_");
        const InputAction = SplitCustomId[1];

        const MongoClient = await getMongoClient();
        const Database = MongoClient.db('production');
        const TwitchNotificationCollection = Database.collection('twitch-notifications');


        // Adding a new Twitch notification
        if ( InputAction === "add" ) {
            // Grab inputs
            /** @type {?String} */
            let inputTwitchName = null;
            /** @type {?String} */
            let inputDiscordChannelId = null;
            /** @type {import('discord-api-types/v10').APIInteractionDataResolvedChannel|null} */
            let resolvedInputChannel = null;
            /** @type {?Array<String>} */
            let inputRoleIds = null;
            /** @type {?String} */
            let inputCustomMessage = null;
            /** @type {Boolean} */
            let inputAutoPublishAnnouncement = false;

            for (let i = 0; i <= ModalComponents.length - 1; i++) {
                // Safety Net
                if ( ModalComponents[i].type === ComponentType.Label ) {
                    let tempTopLevelComp = ModalComponents[i].component;
                    // Twitch Name
                    if ( tempTopLevelComp.custom_id === "twitch-name" ) {
                        inputTwitchName = tempTopLevelComp.value;
                    }
                    // Discord Channel Id
                    else if ( tempTopLevelComp.custom_id === "discord-channel" ) {
                        inputDiscordChannelId = tempTopLevelComp.values.shift();
                        resolvedInputChannel = interaction.data.resolved?.channels[inputDiscordChannelId];
                    }
                    // Role Ids
                    else if ( tempTopLevelComp.custom_id === "roles-pinged" ) {
                        inputRoleIds = tempTopLevelComp.values;
                    }
                    // Custom Message
                    else if ( tempTopLevelComp.custom_id === "custom-message" ) {
                        inputCustomMessage = tempTopLevelComp.value;
                    }
                    // Auto-publish
                    else if ( tempTopLevelComp.custom_id === "auto-publish" ) {
                        inputAutoPublishAnnouncement = tempTopLevelComp.value;
                    }
                }
            }


            // Validate given Twitch Channel name is a valid Twitch Channel
            let twitchUser = await TwitchApiClient.users.getUserByName(inputTwitchName);

            if ( twitchUser == null ) {
                // Not a valid Twitch user, reject instantly
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'TWITCH_NOTIF_ADD_ERROR_INVALID_TWITCH_USERNAME', `**${inputTwitchName}**`)
                    }
                });
            }

            // Validate given Twitch Channel hasn't already been added for this Discord Server
            /* * @type {import('../../../Modules/Notifications/TwitchNotifications.js').TwitchNotificationConfig[]}*/
            /* let fetchedTwitchNotifs = JSON.parse(await cfEnv.crimsonkv.get(`twitchNotifications`));
            let guildTwitchNotifs = fetchedTwitchNotifs?.find(item => item.DiscordGuildId === interaction.guild_id); */

            let findExistingItem;
            // TODO: Switch to Mongo
            // TODO: Plan MongoDB layout
            
            if ( fetchedTwitchNotifs != null && fetchedTwitchNotifs.length !== 0 && guildTwitchNotifs != undefined && guildTwitchNotifs.TwitchGoLiveConfig.length !== 0 ) {
                let doesTwitchChannelAlreadyExist = guildTwitchNotifs.TwitchGoLiveConfig.find(item => item.TwitchChannelId === twitchUser.id);
                if ( doesTwitchChannelAlreadyExist != undefined ) {
                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: localize(interaction.locale, 'TWITCH_NOTIF_ADD_ERROR_TWITCH_CHANNEL_ALREADY_ADDED', `**${inputTwitchName}**`)
                        }
                    });
                }
            }


            // Validate given Discord Channel is both viewable and chattable for TwiLite
            let hasViewPermission = await checkForPermissionInChannel(PermissionFlagsBits.ViewChannel, interaction.guild_id, inputDiscordChannelId);

            if ( hasViewPermission === false || hasViewPermission === 'NoAccess' ) {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'TWITCH_NOTIF_ADD_ERROR_MISSING_VIEW_CHANNEL_PERMISSION', `**${inputTwitchName}**`, `<#${inputDiscordChannelId}>`)
                    }
                });
            }

            let hasSendPermission = await checkForPermissionInChannel(PermissionFlagsBits.SendMessages, interaction.guild_id, inputDiscordChannelId);

            if ( hasSendPermission === false ) {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'TWITCH_NOTIF_ADD_ERROR_MISSING_SEND_MESSAGES_PERMISSION', `**${inputTwitchName}**`, `<#${inputDiscordChannelId}>`)
                    }
                });
            }


            // If input channel is not an Announcement-type Channel, force-set the "Auto Publish" field to `false`
            if ( resolvedInputChannel.type !== ChannelType.GuildAnnouncement ) { inputAutoPublishAnnouncement = false; }


            // Validation complete, now create Twitch Webhook & store to KV
            try {
                // Create Twitch EventSub Webhook subscription
                let twitchToken = await getTwitchAccessToken(cfEnv);

                let twitchApiRequest = await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions`, {
                    method: 'POST',
                    headers: {
                        "Authorization": `Bearer ${twitchToken}`,
                        "Client-ID": `${TWITCH_CLIENT_ID}`,
                        "Content-Type": `application/json`
                    },
                    body: JSON.stringify({
                        "type": `stream.online`,
                        "version": `1`,
                        "condition": {
                            "broadcaster_user_id": `${twitchUser.id}`
                        },
                        "transport": {
                            "method": `webhook`,
                            "callback": `https://${CF_WORKER_URL}/twitch-webhooks`,
                            "secret": `${RANDOMLY_GENERATED_FIXED_STRING}`
                        }
                    })
                });

                if ( twitchApiRequest.status != 202 && twitchApiRequest.status != 409 ) {
                    console.error(`Twitch \`stream.online\` Webhook subscription failed. Response code: ${twitchApiRequest.status} ${twitchApiRequest.statusText}`);

                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: localize(interaction.locale, 'TWITCH_NOTIF_ADD_ERROR_GENERIC', `${inputTwitchName}`)
                        }
                    });
                }

                // Store to DB
                /** @type {import('../../../Modules/Notifications/TwitchNotifications.js').TwitchGoLiveConfig}*/
                let storeData = {
                    TwitchWebhookSubscriptionId: "",
                    TwitchChannelId: twitchUser.id,
                    TwitchChannelName: twitchUser.name,
                    DiscordChannelId: inputDiscordChannelId,
                    IsNotificationEnabled: true, // For now, only settable by TwiLite itself when a Server looses TwiLite Inferno or re-gains Inferno
                    DiscordGuildLocale: interaction.guild_locale,
                    CustomMessage: inputCustomMessage != "" ? inputCustomMessage : "",
                    PingRoleIds: inputRoleIds.length > 0 ? inputRoleIds : [],
                    AutoPublishAnnouncement: inputAutoPublishAnnouncement
                };

                if ( twitchApiRequest.status === 202 ) {
                    let twitchApiData = await twitchApiRequest.json();
                    storeData.TwitchWebhookSubscriptionId = twitchApiData.data[0].id;
                }
                else if ( twitchApiRequest.status === 409 ) {
                    // Since we won't get a returned Subscription ID from Twitch, we need to copy it from another instance for the same Twitch Channel.
                    for ( let i = 0; i <= fetchedTwitchNotifs.length; i++ ) {
                        if ( fetchedTwitchNotifs[i].DiscordGuildId === interaction.guild_id ) { continue; }

                        for ( let j = 0; j <= fetchedTwitchNotifs[i].TwitchGoLiveConfig.length; j++ ) {
                            if ( fetchedTwitchNotifs[i].TwitchGoLiveConfig[j].TwitchChannelId === twitchUser.id ) {
                                storeData.TwitchWebhookSubscriptionId = fetchedTwitchNotifs[i].TwitchGoLiveConfig[j].TwitchWebhookSubscriptionId;
                                break;
                            }
                        }
                    }
                }

                if ( fetchedTwitchNotifs == null ) { fetchedTwitchNotifs = []; }
                if ( fetchedTwitchNotifs.length === 0 || guildTwitchNotifs == undefined ) {
                    fetchedTwitchNotifs.push({ DiscordGuildId: interaction.guild_id, TwitchGoLiveConfig: [storeData] });
                }
                else {
                    guildTwitchNotifs.TwitchGoLiveConfig.push(storeData);
                }

                await cfEnv.crimsonkv.put(`twitchNotifications`, JSON.stringify(fetchedTwitchNotifs));

                return await listTwitchNotifications(interaction, cfEnv, 'EDIT');
            }
            catch (err) {
                console.error(err);

                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'TWITCH_NOTIF_ADD_ERROR_GENERIC', `${inputTwitchName}`)
                    }
                });
            }

        }
        // Edit or Delete a selected existing Twitch Notification
        else if ( InputAction === 'edit' ) {
            let twitchId = SplitCustomId.pop();

            // Grab inputs
            /** @type {?String} */
            let inputDiscordChannelId = null;
            /** @type {import('discord-api-types/v10').APIInteractionDataResolvedChannel|null} */
            let resolvedInputChannel = null;
            /** @type {?Array<String>} */
            let inputRoleIds = null;
            /** @type {?String} */
            let inputCustomMessage = null;
            /** @type {?Boolean} */
            let inputDeletionState = null;

            for (let i = 0; i <= ModalComponents.length - 1; i++) {
                // Safety Net
                if ( ModalComponents[i].type === ComponentType.Label ) {
                    let tempTopLevelComp = ModalComponents[i].component;
                    // Discord Channel Id
                    if ( tempTopLevelComp.custom_id === "discord-channel" ) {
                        inputDiscordChannelId = tempTopLevelComp.values.shift();
                        resolvedInputChannel = interaction.data.resolved?.channels[inputDiscordChannelId];
                    }
                    // Role Ids
                    else if ( tempTopLevelComp.custom_id === "roles-pinged" ) {
                        inputRoleIds = tempTopLevelComp.values;
                    }
                    // Custom Message
                    else if ( tempTopLevelComp.custom_id === "custom-message" ) {
                        inputCustomMessage = tempTopLevelComp.value;
                    }
                    // Deletion state
                    else if ( tempTopLevelComp.custom_id === "deletion-state" ) {
                        inputDeletionState = tempTopLevelComp.value;
                    }
                }
            }


            /** @type {import('../../../Modules/Notifications/TwitchNotifications.js').TwitchNotificationConfig[]}*/
            let fetchedTwitchNotifs = JSON.parse(await cfEnv.crimsonkv.get(`twitchNotifications`));
            let guildTwitchNotificationIndex = fetchedTwitchNotifs.findIndex(item => item.DiscordGuildId === interaction.guild_id);
            let guildTwitchNotificationObject = fetchedTwitchNotifs.find(item => item.DiscordGuildId === interaction.guild_id);
            let selectedTwitchNotificationIndex = guildTwitchNotificationObject.TwitchGoLiveConfig.findIndex(item => item.TwitchChannelId === twitchId);
            let selectedTwitchNotificationObject = guildTwitchNotificationObject.TwitchGoLiveConfig.find(item => item.TwitchChannelId === twitchId);


            // FIRST CHECK DELETION STATE
            //   If true (selected), ignore all other values and DELETE the stored notification settings
            if ( inputDeletionState === true ) {
                let catchDeletedObject = guildTwitchNotificationObject.TwitchGoLiveConfig.splice(selectedTwitchNotificationIndex, 1);
                fetchedTwitchNotifs.splice(guildTwitchNotificationIndex, 1, guildTwitchNotificationObject);

                // If there are no other Discord Guilds also subscribed to that same Twitch Channel's "Go Live" events, remove the Twitch subscription
                let keepTwitchWebhookEvent = false;

                for (let i = 0; i <= fetchedTwitchNotifs.length - 1; i++) {
                    for (let j = 0; j <= fetchedTwitchNotifs[i].TwitchGoLiveConfig.length - 1; j++) {
                        if ( fetchedTwitchNotifs[i].TwitchGoLiveConfig[j].TwitchChannelId === selectedTwitchNotificationObject.TwitchChannelId ) {
                            keepTwitchWebhookEvent = true;
                            break;
                        }
                    }
                }

                if ( keepTwitchWebhookEvent === false ) {
                    // Remove Twitch webhook subscription
                    let twitchToken = await getTwitchAccessToken(cfEnv);

                    let twitchApiDeleteRequest = await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions`, {
                        method: 'DELETE',
                        headers: {
                            "Authorization": `Bearer ${twitchToken}`,
                            "Client-ID": `${TWITCH_CLIENT_ID}`,
                            "Content-Type": `application/json`
                        },
                        body: JSON.stringify({
                            "id": `${selectedTwitchNotificationObject.TwitchWebhookSubscriptionId}`
                        })
                    });
                }

                // Deletion success, save & ACK
                try {
                    await cfEnv.crimsonkv.put(`twitchNotifications`, JSON.stringify(fetchedTwitchNotifs));

                    return await listTwitchNotifications(interaction, cfEnv, 'EDIT');
                }
                catch (err) {
                    console.error(err);

                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: localize(interaction.locale, 'TWITCH_NOTIF_DELETE_ERROR_GENERIC', `**${selectedTwitchNotificationObject.TwitchChannelName}**`)
                        }
                    });
                }
            }


            // Deletion not requested, thus edit instead!
            
            // Check there were actually changes made to the settings
            //   (Using duplicated arrays so we don't accidentally break something somehow by accident)
            let clonedInputRoleIds = inputRoleIds;
            let clonedStorageRoleId = selectedTwitchNotificationObject.PingRoleIds;

            if (
                (inputDiscordChannelId === selectedTwitchNotificationObject.DiscordChannelId)
                && (clonedInputRoleIds.sort().toString() === clonedStorageRoleId.sort().toString())
                && (inputCustomMessage === selectedTwitchNotificationObject.CustomMessage)
            ) {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'TWITCH_NOTIF_EDIT_ERROR_FIELDS_UNCHANGED', `**${selectedTwitchNotificationObject.TwitchChannelName}**`)
                    }
                });
            }

            
            // Update changed values

            // Discord Channel Id
            if ( (inputDiscordChannelId !== selectedTwitchNotificationObject.DiscordChannelId) ) {
                // Validate new channel is usable
                // Validate given Discord Channel is both viewable and chattable for TwiLite
                let hasViewPermission = await checkForPermissionInChannel(PermissionFlagsBits.ViewChannel, interaction.guild_id, inputDiscordChannelId);

                if ( hasViewPermission === false || hasViewPermission === 'NoAccess' ) {
                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: localize(interaction.locale, 'TWITCH_NOTIF_EDIT_ERROR_DISCORD_CHANNEL_MISSING_VIEW_CHANNEL_PERMISSION', `<#${inputDiscordChannelId}>`)
                        }
                    });
                }

                let hasSendPermission = await checkForPermissionInChannel(PermissionFlagsBits.SendMessages, interaction.guild_id, inputDiscordChannelId);

                if ( hasSendPermission === false ) {
                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: localize(interaction.locale, 'TWITCH_NOTIF_EDIT_ERROR_DISCORD_CHANNEL_MISSING_SEND_MESSAGES_PERMISSION', `<#${inputDiscordChannelId}>`)
                        }
                    });
                }

                // Validation successful, set new value
                selectedTwitchNotificationObject.DiscordChannelId = inputDiscordChannelId;
            }

            // If input channel is not an Announcement-type Channel, force-set the "Auto Publish" field to `false`
            //   NOTE: Since Discord has a max limit of 5 top-level components per Modal, and the "Edit" Modal is already at that limit - I cannot allow for editing this field after creation.
            //         As such, I will have to handle the Channel's type changing here and ignore the fact the User cannot edit this setting without deleting & re-creating the notification config
            if ( resolvedInputChannel.type !== ChannelType.GuildAnnouncement ) { selectedTwitchNotificationObject.AutoPublishAnnouncement = false; }

            // Pinged Roles
            if ( (clonedInputRoleIds.sort().toString() !== clonedStorageRoleId.sort().toString()) ) {
                selectedTwitchNotificationObject.PingRoleIds = inputRoleIds;

            }

            // Custom Message
            if ( (inputCustomMessage !== selectedTwitchNotificationObject.CustomMessage) ) {
                selectedTwitchNotificationObject.CustomMessage = inputCustomMessage;

            }


            // Attempt saving new values to DB
            guildTwitchNotificationObject.TwitchGoLiveConfig.splice(selectedTwitchNotificationIndex, 1, selectedTwitchNotificationObject);
            fetchedTwitchNotifs.splice(guildTwitchNotificationIndex, 1, guildTwitchNotificationObject);

            try {
                await cfEnv.crimsonkv.put(`twitchNotifications`, JSON.stringify(fetchedTwitchNotifs));

                return await listTwitchNotifications(interaction, cfEnv, 'EDIT');
            }
            catch (err) {
                console.error(err);
                    
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'TWITCH_NOTIF_EDIT_ERROR_GENERIC', `**${selectedTwitchNotificationObject.TwitchChannelName}**`)
                    }
                });
            }

        }
        // Resetting all Twitch Notifications for the Server
        else if ( InputAction === 'reset' ) {
            // Grab input
            /** @type {?Boolean} */
            let inputConfirmation = null;

            for (let i = 0; i <= ModalComponents.length - 1; i++) {
                // Safety Net
                if ( ModalComponents[i].type === ComponentType.Label ) {
                    let tempTopLevelComp = ModalComponents[i].component;
                    // Confirmation
                    if ( tempTopLevelComp.custom_id === "confirmation" ) {
                        inputConfirmation = tempTopLevelComp.value;
                    }
                }
            }


            if ( inputConfirmation === true ) {
                // Reset confirmed, so remove all Twitch Notifications for that Guild from DB
                /** @type {import('../../../Modules/Notifications/TwitchNotifications.js').TwitchNotificationConfig[]}*/
                let fetchedTwitchNotifs = JSON.parse(await cfEnv.crimsonkv.get(`twitchNotifications`));
                let guildTwitchNotificationIndex = fetchedTwitchNotifs.findIndex(item => item.DiscordGuildId === interaction.guild_id);
                let catchThisDeletedObject = fetchedTwitchNotifs.splice(guildTwitchNotificationIndex, 1);

                // Remove all Twitch webhook subscriptions
                let twitchToken = await getTwitchAccessToken(cfEnv);

                catchThisDeletedObject.forEach(configItem => {
                    configItem.TwitchGoLiveConfig.forEach(async goLiveItem => {
                        // If there are no other Discord Guilds also subscribed to that same Twitch Channel's "Go Live" events, remove the Twitch subscription
                        let keepTwitchWebhook = false;

                        for (let i = 0; i <= fetchedTwitchNotifs.length - 1; i++) {
                            for (let j = 0; j <= fetchedTwitchNotifs[i].TwitchGoLiveConfig.length - 1; j++) {
                                if ( fetchedTwitchNotifs[i].TwitchGoLiveConfig[j].TwitchChannelId === goLiveItem.TwitchChannelId ) {
                                    keepTwitchWebhook = true;
                                    break;
                                }
                            }
                        }

                        if ( keepTwitchWebhook === false ) {
                            let twitchApiDeleteRequest = await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions`, {
                                method: 'DELETE',
                                headers: {
                                    "Authorization": `Bearer ${twitchToken}`,
                                    "Client-ID": `${TWITCH_CLIENT_ID}`,
                                    "Content-Type": `application/json`
                                },
                                body: JSON.stringify({
                                    "id": `${goLiveItem.TwitchWebhookSubscriptionId}`
                                })
                            });
                        }

                    });
                });

                try {
                    await cfEnv.crimsonkv.put(`twitchNotifications`, JSON.stringify(fetchedTwitchNotifs));

                    return await listTwitchNotifications(interaction, cfEnv, 'EDIT');
                }
                catch (err) {
                    console.error(err);

                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: localize(interaction.locale, 'TWITCH_NOTIF_RESET_ERROR_GENERIC')
                        }
                    });
                }
            }
            else {
                // Reset cancelled (checkbox not selected)
                //   This is just a faked Edit Message response so we can clear away the Modal from the User's screen

                return await listTwitchNotifications(interaction, cfEnv, 'EDIT');
            }
        }
    }
}
