import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { DISCORD_APP_USER_ID, DISCORD_TOKEN } from '../../../config.js';


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
    cooldown: 5,

    /** Runs the Button
     * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeButton(interaction, interactionUser) {
        // Parse params out of Custom ID
        const CustomParams = interaction.data.custom_id.split("_");
        const ActionName = CustomParams[1].toUpperCase();
        const OriginalUserId = CustomParams[2];
        const OriginalTargetId = CustomParams[3];


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
        let originalTriggeringUserName = interaction.message.interaction_metadata?.user.global_name != null ? interaction.message.interaction_metadata?.user.global_name : interaction.message.interaction_metadata?.user.username;
        let originalTargetUserName = interaction.member != undefined && interaction.member?.nick != null ? interaction.member.nick
            : interaction.member != undefined && interaction.member?.nick == null && interaction.member?.user.global_name != null ? interaction.member.user.global_name
            : interaction.member != undefined && interaction.member?.nick == null && interaction.member?.user.global_name == null ? interaction.member.user.username
            : interaction.member == undefined && interaction.user?.global_name != null ? interaction.user.global_name
            : interaction.user.username;

        
        // Construct display message
        let displayMessage = localize(interaction.guild_locale != undefined ? interaction.guild_locale : interaction.locale, `ACTION_RETURN_${ActionName}`, originalTargetUserName, originalTriggeringUserName);

        // ACK & remove Button
        let patchOutButton = await fetch(`https://discord.com/api/v10/interactions/${interaction.id}/${interaction.token}/callback`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bot ${DISCORD_TOKEN}`
            },
            method: "POST",
            body: {
                "type": InteractionResponseType.UpdateMessage,
                "data": {
                    "components": []
                }
            }
        });

        if ( patchOutButton.status === 204 ) {
            await fetch(`https://discord.com/api/v10/webhooks/${DISCORD_APP_USER_ID}/${interaction.token}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bot ${DISCORD_TOKEN}`
                },
                method: "POST",
                body: {
                    "allowed_mentions": { "parse": [] },
                    "content": displayMessage
                }
            });
        }

        return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
    }
}
