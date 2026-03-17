import { ChannelType, ComponentType, InteractionResponseType, MessageFlags, TextInputStyle } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { editTwitchNotification } from '../../../Modules/Notifications/TwitchNotifications.js';


export const Button = {
    /** The Button's name - set as the START of the Button's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "buttonName_extraData"
     * @type {String}
     */
    name: "twitch",

    /** Button's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles managing Twitch Notifications",

    /** Button's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 8,

    /** Runs the Button
     * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     * @param {*} cfEnv 
     */
    async executeButton(interaction, interactionUser, cfEnv) {
        // Split up custom ID
        const SplitCustomId = interaction.data.custom_id.split("_");
        /** @type {'add'|'edit'|'reset'} */
        const InputAction = SplitCustomId[1];


        // ADD - show Modal for adding a new Twitch Notification source
        if ( InputAction === "add" ) {
            // Construct modal
            /** @type {import('discord-api-types/v10').APIModalInteractionResponseCallbackData} */
            let responseAddModal = {
                "custom_id": `twitch_add`,
                "title": localize(interaction.locale, 'TWITCH_NOTIF_ADD_MODAL_TITLE'),
                "components": [{
                    // Twitch Channel
                    "type": ComponentType.Label,
                    "label": localize(interaction.locale, 'TWITCH_NOTIF_ADD_MODAL_TWITCH_CHANNEL_LABEL_NAME'),
                    "description": localize(interaction.locale, 'TWITCH_NOTIF_ADD_MODAL_TWITCH_CHANNEL_LABEL_DESCRIPTION'),
                    "component": {
                        "type": ComponentType.TextInput,
                        "style": TextInputStyle.Short,
                        "custom_id": `twitch-name`,
                        "max_length": 25,
                        "min_length": 4,
                        "required": true
                    }
                }, {
                    // Discord Channel to post in
                    "type": ComponentType.Label,
                    "label": localize(interaction.locale, 'TWITCH_NOTIF_ADD_MODAL_DISCORD_CHANNEL_LABEL_NAME'),
                    "description": localize(interaction.locale, 'TWITCH_NOTIF_ADD_MODAL_DISCORD_CHANNEL_LABEL_DESCRIPTION'),
                    "component": {
                        "type": ComponentType.ChannelSelect,
                        "custom_id": `discord-channel`,
                        "channel_types": [ ChannelType.GuildText, ChannelType.GuildAnnouncement ],
                        "max_values": 1,
                        "required": true
                    }
                }, {
                    // Roles to ping in "go live" notification
                    "type": ComponentType.Label,
                    "label": localize(interaction.locale, 'TWITCH_NOTIF_ADD_MODAL_ROLES_TO_PING_LABEL_NAME'),
                    "description": localize(interaction.locale, 'TWITCH_NOTIF_ADD_MODAL_ROLES_TO_PING_LABEL_DESCRIPTION'),
                    "component": {
                        "type": ComponentType.RoleSelect,
                        "custom_id": `roles-pinged`,
                        "max_values": 2,
                        "required": false
                    }
                }, {
                    // Custom message for "go live" notification
                    "type": ComponentType.Label,
                    "label": localize(interaction.locale, 'TWITCH_NOTIF_ADD_MODAL_CUSTOM_MESSAGE_LABEL_NAME'),
                    "description": localize(interaction.locale, 'TWITCH_NOTIF_ADD_MODAL_CUSTOM_MESSAGE_LABEL_DESCRIPTION'),
                    "component": {
                        "type": ComponentType.TextInput,
                        "style": TextInputStyle.Paragraph,
                        "custom_id": `custom-message`,
                        "max_length": 250,
                        "required": false,
                    }
                }, {
                    // Checkbox for setting auto-publishing state
                    "type": ComponentType.Label,
                    "label": localize(interaction.locale, 'TWITCH_NOTIF_ADD_MODAL_AUTO_PUBLISH_LABEL_NAME'),
                    "description": localize(interaction.locale, 'TWITCH_NOTIF_ADD_MODAL_AUTO_PUBLISH_LABEL_DESCRIPTION'),
                    "component": {
                        "type": ComponentType.Checkbox,
                        "custom_id": `auto-publish`
                    }
                }]
            };

            // ACK
            return new JsonResponse({
                type: InteractionResponseType.Modal,
                data: responseAddModal
            });
            
        }
        // EDIT - Show a modal with options to edit or delete the selected Twitch Notification
        else if ( InputAction === 'edit' ) {
            // Grab Twitch ID from the Button
            let customId = interaction.data.custom_id.split("_");
            let selectedTwitchId = customId.pop();

            return await editTwitchNotification(interaction, cfEnv, selectedTwitchId);

        }
        // RESET - Show confirmation modal for removing *all* added Twitch Notifications for this Server
        else if ( InputAction === 'reset' ) {
            // Construct modal
            /** @type {import('discord-api-types/v10').APIModalInteractionResponseCallbackData} */
            let responseResetModal = {
                "custom_id": `twitch_reset`,
                "title": localize(interaction.locale, 'TWITCH_NOTIF_RESET_MODAL_TITLE'),
                "components": [{
                    // Twitch Channel
                    "type": ComponentType.Label,
                    "label": localize(interaction.locale, 'TWITCH_NOTIF_RESET_MODAL_CONFIRM_LABEL_NAME'),
                    "description": localize(interaction.locale, 'TWITCH_NOTIF_RESET_MODAL_CONFIRM_LABEL_DESCRIPTION'),
                    "component": {
                        "type": ComponentType.Checkbox,
                        "custom_id": `confirmation`
                    }
                }]
            };

            // ACK
            return new JsonResponse({
                type: InteractionResponseType.Modal,
                data: responseResetModal
            });
        }



        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.Ephemeral,
                content: "This Button has not yet been implemented yet!"
            }
        });
    }
}
