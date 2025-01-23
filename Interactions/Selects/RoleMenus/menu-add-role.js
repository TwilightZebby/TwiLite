import { ComponentType, InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from '@discordjs/builders';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { DISCORD_APP_USER_ID, DISCORD_TOKEN } from '../../../config.js';
import { IMAGE_BUTTON_COLORS } from '../../../Assets/Hyperlinks.js';
import { UtilityCollections } from '../../../Utility/utilityConstants.js';


export const Select = {
    /** The Select's name - set as the START of the Button's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "selectName_extraData"
     * @type {String}
     */
    name: "menu-add-role",

    /** Select's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles selecting a Role to be added to a Role Menu",

    /** Select's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 3,

    /** Runs the Select
     * @param {import('discord-api-types/v10').APIMessageComponentSelectMenuInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeSelect(interaction, interactionUser) {
        // Grab Role
        const InputRoleId = interaction.data.values.pop();

        // Fetch current Menu
        const UserId = interaction.member != undefined ? interaction.member?.user.id : interaction.user?.id;
        let originalResponse = UtilityCollections.RoleMenuManagement.get(UserId);
        
        // Validate selected Role isn't already on this Menu
        let isRoleAdded = false;

        originalResponse.menuButtons.forEach(roleButton => {
            if ( roleButton.data.custom_id.includes(InputRoleId) ) { isRoleAdded = true; return; }
        });

        // ACK if Role is already on Role Menu
        if ( isRoleAdded ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: `${localize(interaction.locale, 'ROLE_MENU_ROLE_ADD_INSTRUCTIONS')}\n\n:warning: ${localize(interaction.locale, 'ROLE_MENU_ERROR_ROLE_ALREADY_ON_MENU', `<@&${InputRoleId}>`)}`
                }
            });
        }


        // ACK next step for adding a Role to this Menu
        const ButtonTypeSelect = new ActionRowBuilder().addComponents([
            new StringSelectMenuBuilder().setCustomId(`menu-add-button_${InputRoleId}`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(interaction.locale, 'ROLE_MENU_SELECT_BUTTON_COLOR')).setOptions([
                new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_BUTTON_BLURPLE')).setValue("blurple"),
                new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_BUTTON_GREEN')).setValue("green"),
                new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_BUTTON_GREY')).setValue("grey"),
                new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_BUTTON_RED')).setValue("red")
            ])
        ]);
        let buttonTypeSelectJson = ButtonTypeSelect.toJSON();

        return new JsonResponse({
            type: InteractionResponseType.UpdateMessage,
            data: {
                components: [buttonTypeSelectJson],
                content: localize(interaction.locale, 'ROLE_MENU_BUTTON_SET_INSTRUCTIONS', `<@&${InputRoleId}>`, IMAGE_BUTTON_COLORS)
            }
        });
    }
}
