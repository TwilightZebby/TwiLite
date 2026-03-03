import { ComponentType, InteractionResponseType, MessageFlags, PermissionFlagsBits } from 'discord-api-types/v10';
import { checkForPermissionInChannel, JsonResponse } from '../../../Utility/utilityMethods.js';
import { TwitchApiClient } from '../../../Utility/utilityConstants.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { listTwitchNotifications } from '../../../Modules/Notifications/TwitchNotifications.js';


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
            /** @type {?Array<String>} */
            let inputRoleIds = null;
            /** @type {?String} */
            let inputCustomMessage = null;

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
                    }
                    // Role Ids
                    else if ( tempTopLevelComp.custom_id === "roles-pinged" ) {
                        inputRoleIds = tempTopLevelComp.values;
                    }
                    // Custom Message
                    else if ( tempTopLevelComp.custom_id === "custom-message" ) {
                        inputCustomMessage = tempTopLevelComp.value;
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


            // Validate given Discord Channel is both viewable and chattable for TwiLite
            let hasViewPermission = await checkForPermissionInChannel(PermissionFlagsBits.ViewChannel, inputDiscordChannelId, interaction.guild_id);

            if ( hasViewPermission === false || hasViewPermission === 'NoAccess' ) {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'TWITCH_NOTIF_ADD_ERROR_MISSING_VIEW_CHANNEL_PERMISSION', `**${inputTwitchName}**`, `<#${inputDiscordChannelId}>`)
                    }
                });
            }

            let hasSendPermission = await checkForPermissionInChannel(PermissionFlagsBits.SendMessages, inputDiscordChannelId, interaction.guild_id);

            if ( hasSendPermission === false ) {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'TWITCH_NOTIF_ADD_ERROR_MISSING_SEND_MESSAGES_PERMISSION', `**${inputTwitchName}**`, `<#${inputDiscordChannelId}>`)
                    }
                });
            }


            // Validation complete, now store to KV
            /** @type {import('../../../Modules/Notifications/TwitchNotifications.js').TwitchNotificationConfig}*/
            let storeData = {
                TwitchChannelId: twitchUser.id,
                TwitchChannelName: twitchUser.name,
                DiscordChannelId: inputDiscordChannelId,
                NotifyOnGoLive: true, // For now, only settable by TwiLite itself when a Server looses TwiLite Inferno or re-gains Inferno
                DiscordGuildLocale: interaction.guild_locale,
                GoLiveMessage: inputCustomMessage != "" ? inputCustomMessage : "",
                GoLivePingRoleIds: inputRoleIds.length > 0 ? inputRoleIds : []
            };

            try {
                let fetchedTwitchNotifs = JSON.parse(await cfEnv.crimsonkv.get(`twitchnotif_${interaction.guild_id}`));
                if ( fetchedTwitchNotifs == null ) { fetchedTwitchNotifs = []; }
                fetchedTwitchNotifs.push(storeData);

                await cfEnv.crimsonkv.put(`twitchnotif_${interaction.guild_id}`, JSON.stringify(fetchedTwitchNotifs));

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
            let fetchedTwitchNotifs = JSON.parse(await cfEnv.crimsonkv.get(`twitchnotif_${interaction.guild_id}`));
            let selectedTwitchNotificationIndex = fetchedTwitchNotifs.findIndex(item => item.TwitchChannelId === twitchId);
            let selectedTwitchNotificationObject = fetchedTwitchNotifs.find(item => item.TwitchChannelId === twitchId);


            // FIRST CHECK DELETION STATE
            //   If true (selected), ignore all other values and DELETE the stored notification settings
            if ( inputDeletionState === true ) {
                let catchDeletedObject = fetchedTwitchNotifs.splice(selectedTwitchNotificationIndex, 1);

                // Deletion success, save & ACK
                try {
                    await cfEnv.crimsonkv.put(`twitchnotif_${interaction.guild_id}`, JSON.stringify(fetchedTwitchNotifs));

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
            let clonedStorageRoleId = selectedTwitchNotificationObject.GoLivePingRoleIds;

            if (
                (inputDiscordChannelId === selectedTwitchNotificationObject.DiscordChannelId)
                && (clonedInputRoleIds.sort().toString() === clonedStorageRoleId.sort().toString())
                && (inputCustomMessage === selectedTwitchNotificationObject.GoLiveMessage)
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
                let hasViewPermission = await checkForPermissionInChannel(PermissionFlagsBits.ViewChannel, inputDiscordChannelId, interaction.guild_id);

                if ( hasViewPermission === false || hasViewPermission === 'NoAccess' ) {
                    return new JsonResponse({
                        type: InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            flags: MessageFlags.Ephemeral,
                            content: localize(interaction.locale, 'TWITCH_NOTIF_EDIT_ERROR_DISCORD_CHANNEL_MISSING_VIEW_CHANNEL_PERMISSION', `<#${inputDiscordChannelId}>`)
                        }
                    });
                }

                let hasSendPermission = await checkForPermissionInChannel(PermissionFlagsBits.SendMessages, inputDiscordChannelId, interaction.guild_id);

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

            // Pinged Roles
            if ( (clonedInputRoleIds.sort().toString() !== clonedStorageRoleId.sort().toString()) ) {
                selectedTwitchNotificationObject.GoLivePingRoleIds = inputRoleIds;

            }

            // Custom Message
            if ( (inputCustomMessage !== selectedTwitchNotificationObject.GoLiveMessage) ) {
                selectedTwitchNotificationObject.GoLiveMessage = inputCustomMessage;

            }


            // Attempt saving new values to DB
            fetchedTwitchNotifs.splice(selectedTwitchNotificationIndex, 1, selectedTwitchNotificationObject);

            try {
                await cfEnv.crimsonkv.put(`twitchnotif_${interaction.guild_id}`, JSON.stringify(fetchedTwitchNotifs));

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
                // Reset confirmed, so remove all Twitch Notifications from DB
                try {
                    await cfEnv.crimsonkv.delete(`twitchnotif_${interaction.guild_id}`);

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
