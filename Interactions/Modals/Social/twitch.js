import { ChannelType, ComponentType, InteractionResponseType, MessageFlags, PermissionFlagsBits } from 'discord-api-types/v10';
import { v7 as uuidv7 } from 'uuid';
import { checkForPermissionInChannel, getTwitchAccessToken, JsonResponse } from '../../../Utility/utilityMethods.js';
import { getTwitchApiClient } from '../../../Utility/utilityConstants.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { listTwitchNotifications, showManageTwitchNotificationPage } from '../../../Modules/Notifications/TwitchNotifications.js';
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
            const TwitchApiClient = getTwitchApiClient();
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
            /** @type {{results: Array<import('../../../Modules/Notifications/TwitchNotifications.js').SchemaTwitchGoLiveNotifications>}} */
            const { results } = await cfEnv.DATABASE
                .prepare("SELECT * FROM TwitchNotifications WHERE discord_guild_id = ? AND twitch_channel_id = ? LIMIT 1")
                .bind(interaction.guild_id, twitchUser.id)
                .run();

            if ( results != null && results.length > 0 ) {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'TWITCH_NOTIF_ADD_ERROR_TWITCH_CHANNEL_ALREADY_ADDED', `**${inputTwitchName}**`)
                    }
                });
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


            // Validation complete, now create Twitch Webhook & store to DB
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
                /** @type {import('../../../Modules/Notifications/TwitchNotifications.js').SchemaTwitchGoLiveNotifications}*/
                let storeData = {
                    notification_id: uuidv7(),
                    discord_guild_id: interaction.guild_id,
                    twitch_channel_id: twitchUser.id,
                    twitch_channel_name: twitchUser.name,
                    discord_guild_locale: interaction.guild_locale,
                    is_notification_enabled: 1,
                    twitch_golive_webhook_subscription_id: "",
                    twitch_categoryupdate_webhook_subscription_id: null,
                    twitch_streamend_webhook_subscription_id: null,
                    discord_channel_id: inputDiscordChannelId,
                    custom_message: inputCustomMessage != "" ? inputCustomMessage : null,
                    ping_role_id: inputRoleIds.length > 0 ? inputRoleIds.shift() : null,
                    auto_publish_announcement: inputAutoPublishAnnouncement === false ? 0 : 1,
                    update_on_category_change: 0,
                    update_on_stream_end: 0
                };

                if ( twitchApiRequest.status === 202 ) {
                    let twitchApiData = await twitchApiRequest.json();
                    storeData.twitch_golive_webhook_subscription_id = twitchApiData.data[0].id;
                }
                else if ( twitchApiRequest.status === 409 ) {
                    // Since we won't get a returned Subscription ID from Twitch, we need to copy it from another instance for the same Twitch Channel.
                    let queryFindTwitchWebhook = await cfEnv.DATABASE
                        .prepare("SELECT * FROM TwitchNotifications WHERE twitch_channel_id = ? LIMIT 5")
                        .bind(twitchUser.id)
                        .run();

                    for ( let i = 0; i <= queryFindTwitchWebhook.results.length - 1; i++ ) {
                        if ( queryFindTwitchWebhook.results[i].discord_guild_id === interaction.guild_id ) { continue; }

                        if ( queryFindTwitchWebhook.results[i].twitch_golive_webhook_subscription_id.length > 0 ) {
                            storeData.twitch_golive_webhook_subscription_id = queryFindTwitchWebhook.results[i].twitch_golive_webhook_subscription_id;
                            break;
                        }
                    }
                }

                // Save to DB (using INSERT)
                const { success } = await cfEnv.DATABASE
                    .prepare("INSERT INTO TwitchNotifications ('notification_id', 'discord_guild_id', 'twitch_channel_id', 'twitch_channel_name', 'discord_guild_locale', 'is_notification_enabled', 'twitch_golive_webhook_subscription_id', 'twitch_categoryupdate_webhook_subscription_id', 'twitch_streamend_webhook_subscription_id', 'discord_channel_id', 'custom_message', 'ping_role_id', 'auto_publish_announcement', 'update_on_category_change', 'update_on_stream_end') VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
                    .bind(storeData.notification_id, storeData.discord_guild_id, storeData.twitch_channel_id, storeData.twitch_channel_name, storeData.discord_guild_locale, storeData.is_notification_enabled, storeData.twitch_golive_webhook_subscription_id, storeData.twitch_categoryupdate_webhook_subscription_id, storeData.twitch_streamend_webhook_subscription_id, storeData.discord_channel_id, storeData.custom_message, storeData.ping_role_id, storeData.auto_publish_announcement, storeData.update_on_category_change, storeData.update_on_stream_end)
                    .run();

                if ( success === false ) {
                    // PURELY so I can manually remove the Twitch Webhook if need be
                    console.warn(`Saving new Twitch Notification failed. Here is the Twitch Webhook Subscription ID for this: ${storeData.twitch_golive_webhook_subscription_id}`)

                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: localize(interaction.locale, 'TWITCH_NOTIF_ADD_ERROR_GENERIC', `${inputTwitchName}`)
                        }
                    });
                }
                else {
                    return await listTwitchNotifications(interaction, cfEnv, 'EDIT');
                }
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
            let inputAutoPublish = null;

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
                        inputRoleIds = tempTopLevelComp.values == null || tempTopLevelComp.values.length === 0 ? null : tempTopLevelComp.values;
                    }
                    // Custom Message
                    else if ( tempTopLevelComp.custom_id === "custom-message" ) {
                        inputCustomMessage = tempTopLevelComp.value == "" ? null : tempTopLevelComp.value;
                    }
                    // Auto Publish
                    else if ( tempTopLevelComp.custom_id === "auto-publish" ) {
                        inputAutoPublish = tempTopLevelComp.value;
                    }
                }
            }


            /** @type {{results: Array<import('../../../Modules/Notifications/TwitchNotifications.js').SchemaTwitchGoLiveNotifications>}} */
            const { results } = await cfEnv.DATABASE
                .prepare("SELECT * FROM TwitchNotifications WHERE discord_guild_id = ? AND twitch_channel_id = ? LIMIT 1")
                .bind(interaction.guild_id, twitchId)
                .run();


            // Validate edits have actually been made
            let extractedInputRoleId = inputRoleIds != null ? inputRoleIds.shift() : null;
            let extractedInputCustomMessage = inputCustomMessage == "" || inputCustomMessage == null ? null : inputCustomMessage;
            let extractedInputAutoPublish = inputAutoPublish === true ? 1 : 0;

            if (
                (inputDiscordChannelId === results[0].discord_channel_id)
                && (extractedInputRoleId === results[0].ping_role_id)
                && (inputCustomMessage === results[0].custom_message)
                && (extractedInputAutoPublish === results[0].auto_publish_announcement)
            ) {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'TWITCH_NOTIF_EDIT_ERROR_FIELDS_UNCHANGED', `**${results[0].twitch_channel_name}**`)
                    }
                });
            }

            
            // Update changed values
            let editableClonedData = results[0];

            // Discord Channel Id
            if ( (inputDiscordChannelId !== results[0].discord_channel_id) ) {
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
                editableClonedData.discord_channel_id = inputDiscordChannelId;
            }

            // If input channel is not an Announcement-type Channel, force-set the "Auto Publish" field to `false`
            if ( resolvedInputChannel.type !== ChannelType.GuildAnnouncement ) { editableClonedData.auto_publish_announcement = 0; }
            else if ( extractedInputAutoPublish !== results[0].auto_publish_announcement ) { editableClonedData.auto_publish_announcement === extractedInputAutoPublish; }

            // Pinged Roles
            if ( (extractedInputRoleId !== results[0].ping_role_id) ) {
                editableClonedData.ping_role_id = extractedInputRoleId;
            }

            // Custom Message
            if ( (extractedInputCustomMessage !== results[0].custom_message) ) {
                editableClonedData.custom_message = extractedInputCustomMessage;
            }


            // Attempt saving new values to DB
            const { success } = await cfEnv.DATABASE
                .prepare("UPDATE TwitchNotifications SET discord_guild_locale = ?, discord_channel_id = ?, custom_message = ?, ping_role_id = ?, auto_publish_announcement = ? WHERE notification_id = ?")
                .bind(interaction.guild_locale, editableClonedData.discord_channel_id, editableClonedData.custom_message, editableClonedData.ping_role_id, editableClonedData.auto_publish_announcement, results[0].notification_id)
                .run();

            if ( success === false ) {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'TWITCH_NOTIF_EDIT_ERROR_GENERIC', `${results[0].twitch_channel_name}`)
                    }
                });
            }
            else {
                return await listTwitchNotifications(interaction, cfEnv, 'EDIT');
            }

        }
        // Deleting a specific Twitch Notification for the Server
        else if ( InputAction === 'delete' ) {
            // Grab input
            /** @type {?Boolean} */
            let inputConfirmation = null;
            let twitchId = SplitCustomId.pop();

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
                // Deletion confirmed

                /** @type {{results: Array<import('../../../Modules/Notifications/TwitchNotifications.js').SchemaTwitchGoLiveNotifications>}} */
                const { results } = await cfEnv.DATABASE
                    .prepare("SELECT * FROM TwitchNotifications WHERE discord_guild_id = ? AND twitch_channel_id = ? LIMIT 1")
                    .bind(interaction.guild_id, twitchId)
                    .run();

                const { success } = await cfEnv.DATABASE
                    .prepare("DELETE FROM TwitchNotifications WHERE discord_guild_id = ? AND twitch_channel_id = ?")
                    .bind(interaction.guild_id, twitchId)
                    .run();

                // If there are no other Discord Guilds also subscribed to that same Twitch Channel's "Go Live" events, remove the Twitch subscription
                let keepTwitchWebhookEvent = false;

                const queryTwitchId = await cfEnv.DATABASE
                    .prepare("SELECT notification_id FROM TwitchNotifications WHERE twitch_channel_id = ?")
                    .bind(twitchId)
                    .run();

                if ( queryTwitchId.results?.length > 0 ) {
                    keepTwitchWebhookEvent = true;
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
                            "id": `${results[0].twitch_golive_webhook_subscription_id}`
                        })
                    });
                }

                // Deletion success, save & ACK
                return await listTwitchNotifications(interaction, cfEnv, 'EDIT');
            }
            else {
                // Reset cancelled (checkbox not selected)
                //   This is just a faked Edit Message response so we can clear away the Modal from the User's screen

                return await showManageTwitchNotificationPage(interaction, cfEnv, twitchId);
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

                /** @type {{results: Array<import('../../../Modules/Notifications/TwitchNotifications.js').SchemaTwitchGoLiveNotifications>}} */
                let { results } = await cfEnv.DATABASE
                    .prepare("SELECT * FROM TwitchNotifications WHERE discord_guild_id = ?")
                    .bind(interaction.guild_id)
                    .run();

                // Remove all Twitch webhook subscriptions, as long as no other Guilds are also subscribed to that Twitch Channel's notifications
                let twitchToken = await getTwitchAccessToken(cfEnv);


                results.forEach(async item => {
                    let keepTwitchWebhook = false;

                    let queryOtherGuildConfigs = await cfEnv.DATABASE
                        .prepare("SELECT twitch_channel_name FROM TwitchNotifications WHERE twitch_channel_id = ? AND NOT discord_guild_id = ?")
                        .bind(item.twitch_channel_id, interaction.guild_id)
                        .run()

                    if ( queryOtherGuildConfigs?.results != null && queryOtherGuildConfigs.results.length !== 0 ) {
                        keepTwitchWebhook = true;
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
                                "id": `${item.twitch_golive_webhook_subscription_id}`
                            })
                        });
                    }
                });


                // Now actually delete from DB
                let queryResetGuildNotifs = cfEnv.DATABASE
                    .prepare("DELETE FROM TwitchNotifications WHERE discord_guild_id = ?")
                    .bind(interaction.guild_id)
                    .run();
                
                return await listTwitchNotifications(interaction, cfEnv, 'EDIT');
            }
            else {
                // Reset cancelled (checkbox not selected)
                //   This is just a faked Edit Message response so we can clear away the Modal from the User's screen

                return await listTwitchNotifications(interaction, cfEnv, 'EDIT');
            }
        }
    }
}
