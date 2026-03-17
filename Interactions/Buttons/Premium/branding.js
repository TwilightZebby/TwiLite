import { ComponentType, InteractionResponseType, MessageFlags, TextInputStyle } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { DefaultDiscordRequestHeaders } from '../../../Utility/utilityConstants.js';


export const Button = {
    /** The Button's name - set as the START of the Button's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "buttonName_extraData"
     * @type {String}
     */
    name: "branding",

    /** Button's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles editing TwiLite's Custom Branding",

    /** Button's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 3,

    /** Runs the Button
     * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeButton(interaction, interactionUser) {
        // Grab if this was "RESET ALL" or "BULK EDIT"
        const CustomId = interaction.data.custom_id.split("_");
        /** @type {'reset'|'bulk-edit'} */
        const InputAction = CustomId.pop();

        if ( InputAction === "reset" ) {
            // Remove TwiLite's custom branding
            let resetRequest = await fetch(`https://discord.com/api/v10/guilds/${interaction.guild_id}/members/@me`, {
                method: 'PATCH',
                headers: DefaultDiscordRequestHeaders,
                body: {
                    "banner": null,
                    "avatar": null,
                    "bio": null
                }
            });

            if ( resetRequest.status === 200 ) {
                return new JsonResponse({
                    type: InteractionResponseType.UpdateMessage,
                    data: {
                        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
                        /** @type {import('discord-api-types/v10').APIMessageTopLevelComponent[]} */
                        components: [{
                            "type": ComponentType.TextDisplay,
                            "content": localize(interaction.locale, 'BRANDING_COMMAND_PROFILE_RESET_ALL_SUCCESS')
                        }]
                    }
                });
            }
            else {
                return new JsonResponse({
                    type: InteractionResponseType.UpdateMessage,
                    data: {
                        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
                        /** @type {import('discord-api-types/v10').APIMessageTopLevelComponent[]} */
                        components: [{
                            "type": ComponentType.TextDisplay,
                            "content": localize(interaction.locale, 'BRANDING_COMMAND_ERROR_PROFILE_RESET_ALL_FAILED')
                        }]
                    }
                });
            }

        }
        else if ( InputAction === "bulk-edit" ) {
            // Show Modal for getting new custom branding

            /** @type {import('discord-api-types/v10').APIModalInteractionResponseCallbackData} */
            let responseModal = {
                "custom_id": "branding",
                "title": localize(interaction.locale, 'BRANDING_COMMAND_MODAL_TITLE'),
                "components": [{
                    // AVATAR
                    "type": ComponentType.Label,
                    "label": localize(interaction.locale, 'BRANDING_COMMAND_MODAL_AVATAR_LABEL'),
                    "description": localize(interaction.locale, 'BRANDING_COMMAND_MODAL_AVATAR_DESCRIPTION'),
                    "component": {
                        "type": ComponentType.FileUpload,
                        "custom_id": "avatar",
                        "min_values": 1,
                        "max_values": 1,
                        "required": false
                    }
                }, {
                    // BANNER
                    "type": ComponentType.Label,
                    "label": localize(interaction.locale, 'BRANDING_COMMAND_MODAL_BANNER_LABEL'),
                    "description": localize(interaction.locale, 'BRANDING_COMMAND_MODAL_BANNER_DESCRIPTION'),
                    "component": {
                        "type": ComponentType.FileUpload,
                        "custom_id": "banner",
                        "min_values": 1,
                        "max_values": 1,
                        "required": false
                    }
                }, {
                    // BIO
                    "type": ComponentType.Label,
                    "label": localize(interaction.locale, 'BRANDING_COMMAND_MODAL_BIO_LABEL'),
                    "description": localize(interaction.locale, 'BRANDING_COMMAND_MODAL_BIO_DESCRIPTION'),
                    "component": {
                        "type": ComponentType.TextInput,
                        "style": TextInputStyle.Paragraph,
                        "custom_id": "bio",
                        "max_length": 190,
                        "required": false
                    }
                }]
            };
            
            return new JsonResponse({
                type: InteractionResponseType.Modal,
                data: responseModal
            });
        }
    }
}
