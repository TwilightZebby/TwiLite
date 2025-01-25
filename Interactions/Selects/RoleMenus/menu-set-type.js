import { InteractionResponseType } from 'discord-api-types/v10';
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
        let originalResponse = UtilityCollections.RoleMenuManagement.get(UserId);
        const InputMenuType = interaction.data.values.shift();

        // Set the type
        originalResponse.menuEmbed.setFooter({ text: localize(interaction.locale, 'ROLE_MENU_TYPE_FOOTER', `${InputMenuType}`) });
        let updateEmbedJson = originalResponse.menuEmbed.toJSON();

        // Edit into main
        await fetch(OriginalInteractionResponseEndpoint(DISCORD_APP_USER_ID, originalResponse.interactionToken), {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bot ${DISCORD_TOKEN}`
            },
            body: JSON.stringify({
                embeds: [updateEmbedJson]
            })
        });

        UtilityCollections.RoleMenuManagement.set(UserId, originalResponse);

        return new JsonResponse({
            type: InteractionResponseType.UpdateMessage,
            data: {
                embeds: [],
                components: [],
                content: localize(interaction.locale, 'ROLE_MENU_SET_TYPE_SUCCESS')
            }
        });
    }
}
