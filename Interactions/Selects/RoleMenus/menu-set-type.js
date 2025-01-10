import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { OriginalInteractionResponseEndpoint, UtilityCollections } from '../../../Utility/utilityConstants.js';
import { DISCORD_APP_USER_ID, DISCORD_TOKEN } from '../../../config.js';


export const Select = {
    /** The Select's name - set as the START of the Button's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "selectName_extraData"
     * @type {String}
     */
    name: "menu-set-type",

    /** Select's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Sets the type of Role Menu",

    /** Select's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 3,

    /** Runs the Select
     * @param {import('discord-api-types/v10').APIMessageComponentSelectMenuInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeSelect(interaction, interactionUser) {
        // Grab needed stuff
        const UserId = interaction.member != undefined ? interaction.member?.user.id : interaction.user?.id;
        let editToken = UtilityCollections.RoleMenuManagement.get(UserId);

        let fetchOriginalResponse = await fetch(OriginalInteractionResponseEndpoint(DISCORD_APP_USER_ID, editToken), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bot ${DISCORD_TOKEN}`
            }
        });
        let originalResponseJson = await fetchOriginalResponse.json();

        let menuEmbed = originalResponseJson["body"]["embeds"][0]["description"];

        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.Ephemeral,
                embeds: [],
                components: [],
                content: `${menuEmbed}`
            }
        });
        const InputMenuType = interaction.data.values.shift();

        // Set the type
        menuEmbed.footer.text = localize(interaction.locale, 'ROLE_MENU_TYPE_FOOTER', `${InputMenuType}`);

        // Edit into main
        await fetch(OriginalInteractionResponseEndpoint(DISCORD_APP_USER_ID, editToken), {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bot ${DISCORD_TOKEN}`
            },
            body: JSON.stringify({
                embeds: [menuEmbed]
            })
        });

        // Clear cache
        UtilityCollections.RoleMenuManagement.delete(UserId);

        return new JsonResponse({
            type: InteractionResponseType.UpdateMessage,
            data: {
                flags: MessageFlags.Ephemeral,
                embeds: [],
                components: [],
                content: localize(interaction.locale, 'ROLE_MENU_SET_TYPE_SUCCESS')
            }
        });
    }
}
