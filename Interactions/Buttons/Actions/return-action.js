import { ComponentType, InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';


export const Button = {
    /** The Button's name - set as the START of the Button's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "buttonName_extraData"
     * @type {String}
     */
    name: "return-action",

    /** Button's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Returns a sent Action",

    /** Button's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 3,

    /** Runs the Button
     * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeButton(interaction, interactionUser) {
        // Parse params out of Custom ID
        let CustomParams = interaction.data.custom_id.split("_");
        const OriginalUserDisplayName = CustomParams.pop();
        const OriginalTargetId = CustomParams.pop();
        const OriginalUserId = CustomParams.pop();
        const ActionName = CustomParams.pop().toUpperCase();

        // Grab Components so we can edit Button out of it
        let messageComponents = interaction.message.components;
        /** Is the Button inside a Container Component (for when GIF is included), or not (when no GIF is included) */
        let isButtonInsideContainer = false;
        if ( messageComponents[0].type === ComponentType.Container ) { isButtonInsideContainer = true; }


        // Ensure User who pressed Button isn't the original sender of the Action
        if ( (interaction.member?.user?.id === OriginalUserId) || (interaction.user?.id === OriginalUserId) ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'ACTION_ERROR_CANNOT_RETURN_TO_SENDER')
                }
            });
        }

        // Ensure User who pressed Button is the original Target of the Action
        if ( (interaction.member?.user?.id !== OriginalTargetId) && (interaction.user?.id !== OriginalTargetId) ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'ACTION_ERROR_RETURN_NOT_TARGETED_AT_SELF')
                }
            });
        }


        // Grab display names
        let originalTargetUserName = interaction.member != undefined && interaction.member?.nick != null ? interaction.member.nick
            : interaction.member != undefined && interaction.member?.nick == null && interaction.member?.user.global_name != null ? interaction.member.user.global_name
            : interaction.member != undefined && interaction.member?.nick == null && interaction.member?.user.global_name == null ? interaction.member.user.username
            : interaction.member == undefined && interaction.user?.global_name != null ? interaction.user.global_name
            : interaction.user.username;

        
        // Construct display message
        let displayMessage = localize(interaction.guild_locale != undefined ? interaction.guild_locale : interaction.locale, `ACTION_RETURN_${ActionName}`, originalTargetUserName, OriginalUserDisplayName);

        // ACK & remove Button (while editing *in* the new message because CF Workers is annoying by not allowing me to use Follow-ups after Patching edits :S)
        let updatedComponents = [];

        if ( isButtonInsideContainer ) {
            let actionGifUri = messageComponents[0].components[1].items[0].media.url;
            let contentText = messageComponents[0].components[0].content;

            /** @type {import('discord-api-types/v10').APIContainerComponent} */
            let newContainer = {
                "id": 1,
                "type": ComponentType.Container,
                "accent_color": messageComponents[0].accent_color,
                "spoiler": false,
                "components": [
                    {
                        "id": 2,
                        "type": ComponentType.TextDisplay,
                        "content": `${contentText}\n\n${displayMessage}`
                    },
                    {
                        "id": 3,
                        "type": ComponentType.MediaGallery,
                        "items": [{
                            "media": {
                                "url": actionGifUri
                            },
                            "spoiler": false
                        }]
                    }
                ]
            };

            updatedComponents.push(newContainer);
        }

        let updatedMessageBody = {
            "type": InteractionResponseType.UpdateMessage
        };
        if ( isButtonInsideContainer ) {
            updatedMessageBody.data = {
                "flags": MessageFlags.IsComponentsV2,
                "components": updatedComponents,
                "allowed_mentions": { parse: [] }
            };
        }
        else {
            updatedMessageBody.data = {
                "content": `${interaction.message.content}\n\n${displayMessage}`,
                "components": updatedComponents,
                "allowed_mentions": { parse: [] }
            };
        }

        return new JsonResponse(updatedMessageBody);
    }
}
