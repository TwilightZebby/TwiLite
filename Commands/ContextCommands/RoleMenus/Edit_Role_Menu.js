import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, MessageFlags, InteractionResponseType, PermissionFlagsBits, ComponentType } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { DISCORD_APP_USER_ID } from '../../../config.js';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from '@discordjs/builders';
import { RoleMentionRegEx, UtilityCollections } from '../../../Utility/utilityConstants.js';

// Role Menu Types
const RoleMenuTypes = [ "TOGGLE", "SWAP", "SINGLE" ];


export const ContextCommand = {
    /** Command's Name, supports both upper- and lower-case, and spaces
     * @type {String}
     */
    name: "Edit Role Menu",

    /** Command's Description
     * @type {String}
     */
    description: "Edit an existing Role Menu",

    /** Type of Context Command
     * @type {ApplicationCommandType}
     */
    commandType: ApplicationCommandType.Message,

    /** Command's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 30,
    

    /** Get the Command's data in a format able to be registered with via Discord's API
     * @returns {import('discord-api-types/v10').RESTPostAPIApplicationCommandsJSONBody}
     */
    getRegisterData() {
        /** @type {import('discord-api-types/v10').RESTPostAPIApplicationCommandsJSONBody} */
        const CommandData = {};

        CommandData.name = this.name;
        CommandData.description = "";
        CommandData.type = this.commandType;
        // Integration Types - 0 for GUILD_INSTALL, 1 for USER_INSTALL.
        //  MUST include at least one. 
        CommandData.integration_types = [ ApplicationIntegrationType.GuildInstall ];
        // Contexts - 0 for GUILD, 1 for BOT_DM (DMs with the App), 2 for PRIVATE_CHANNEL (DMs/GDMs that don't include the App).
        //  MUST include at least one. PRIVATE_CHANNEL can only be used if integration_types includes USER_INSTALL
        CommandData.contexts = [ InteractionContextType.Guild ];
        // Default Command Permission Requirements
        CommandData.default_member_permissions = String(PermissionFlagsBits.ManageRoles);

        return CommandData;
    },

    /** Runs the Command
     * @param {import('discord-api-types/v10').APIMessageApplicationCommandGuildInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeCommand(interaction, interactionUser) {
        // Grab data
        const SourceMessage = interaction.data.resolved.messages[interaction.data.target_id];
        const SourceComponents = SourceMessage.components;
        let findMenuType = SourceComponents[0].components.find(component => component.id === 6);
        const SourceMenuType = findMenuType != undefined ? findMenuType.content.split(": ").pop() : undefined;

        // Validate Message this was used on *does* contain one of TwiLite's Role Menus
        if ( SourceMessage.author.id !== DISCORD_APP_USER_ID ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'EDIT_ROLE_MENU_COMMAND_ERROR_MESSAGE_INVALID')
                }
            });
        }

        if ( SourceMenuType == undefined || !RoleMenuTypes.includes(SourceMenuType) ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'EDIT_ROLE_MENU_COMMAND_ERROR_MESSAGE_INVALID')
                }
            });
        }


        // Permission check for MANAGE_ROLES
        let appPerms = BigInt(interaction.app_permissions);
        if ( !((appPerms & PermissionFlagsBits.ManageRoles) == PermissionFlagsBits.ManageRoles) ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'EDIT_ROLE_MENU_COMMAND_ERROR_MISSING_MANAGE_ROLE_PERMISSION')
                }
            });
        }

        // Permission check for READ_MESSAGE_HISTORY
        if ( !((appPerms & PermissionFlagsBits.ReadMessageHistory) == PermissionFlagsBits.ReadMessageHistory) ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'EDIT_ROLE_MENU_COMMAND_ERROR_MISSING_MESSAGE_HISTORY_PERMISSION')
                }
            });
        }

        // For later
        const UserId = interaction.member != undefined ? interaction.member?.user.id : interaction.user?.id;

        // Create localised components
        const SelectMenu = new ActionRowBuilder().addComponents([
            new StringSelectMenuBuilder().setCustomId(`configure-role-menu`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(interaction.locale, 'ROLE_MENU_SELECT_AN_ACTION')).setOptions([
                new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_SET_MENU_TYPE')).setValue("set-type").setDescription(localize(interaction.locale, 'ROLE_MENU_SET_MENU_TYPE_DESCRIPTION')).setEmoji({ name: `🔧` }),
                new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_CONFIGURE_EMBED')).setValue("configure-embed").setDescription(localize(interaction.locale, 'ROLE_MENU_CONFIGURE_EMBED_DESCRIPTION')).setEmoji({ name: `StatusRichPresence`, id: `842328614883295232` }),
                new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_ADD_ROLE')).setValue("add-role").setDescription(localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_DESCRIPTION')).setEmoji({ name: `RoleAdd`, id: `1201474746810904607` }),
                new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_REMOVE_ROLE')).setValue("remove-role").setDescription(localize(interaction.locale, 'ROLE_MENU_REMOVE_ROLE_DESCRIPTION')).setEmoji({ name: `RoleRemove`, id: `1201476372997079040` }),
                new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_ADD_REQUIREMENT')).setValue("add-requirement").setDescription(localize(interaction.locale, 'ROLE_MENU_ADD_REQUIREMENT_DESCRIPTION')).setEmoji({ name: `RequirementAdd`, id: `1201477187522531348` }),
                new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_REMOVE_REQUIREMENT')).setValue("remove-requirement").setDescription(localize(interaction.locale, 'ROLE_MENU_REMOVE_REQUIREMENT_DESCRIPTION')).setEmoji({ name: `RequirementRemove`, id: `1201477188306878540` }),
                new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_SAVE_AND_UPDATE')).setValue("save").setDescription(localize(interaction.locale, 'ROLE_MENU_SAVE_AND_UPDATE_DESCRIPTION')).setEmoji({ name: `IconActivity`, id: `815246970457161738` }),
                new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_CANCEL_CONFIGURATION')).setValue("cancel").setDescription(localize(interaction.locale, 'ROLE_MENU_CANCEL_CONFIGURATION_DESCRIPTION')).setEmoji({ name: `❌`})
            ])
        ]);
        

        // ***** Setup for Menu Configuration
        // Convert Component v2-based menu into Embed-based preview (Menu Type was already done above)
        let menuTitleComponent = SourceComponents[0].components.find(component => component.id === 2);
        let menuDescriptionComponent = SourceComponents[0].components.find(component => component.id === 3);
        let menuRequirementComponent = SourceComponents[0].components.find(component => component.id === 5);
        
        // Pull Action Rows out
        let menuActionRowComponents = SourceComponents[0].components.filter(component => component.type === ComponentType.ActionRow);


        // Make the Embed Builder
        let menuEmbedBuilder = new EmbedBuilder();
        menuEmbedBuilder.setTitle(menuTitleComponent.content);
        if ( menuDescriptionComponent != undefined && menuDescriptionComponent.content != "" ) {
            menuEmbedBuilder.setDescription(menuDescriptionComponent.content);
        }

        // Make the Button Builders
        let menuButtonBuilders = [];
        let menuComponentsJson = [];
        let temp = new ActionRowBuilder();

        menuActionRowComponents.forEach(menuRow => {
            menuRow.components.forEach(roleButton => {
                let tempButton = new ButtonBuilder(roleButton);
                menuButtonBuilders.push(tempButton);
                
                // Just so Discord's API doesn't throw 500's at me
                if ( temp.components.length === 5 ) {
                    menuComponentsJson.push(temp.toJSON());
                    temp.setComponents(tempButton);
                }
                else {
                    temp.addComponents(tempButton);
                }
                
                // If last Button, force-push back into Array
                let checkIndex = menuRow.components.findIndex(theButton => theButton.custom_id === `role_${roleButton.custom_id.split("_").pop()}`);
                if ( menuRow.components.length - 1 === checkIndex ) {
                    menuComponentsJson.push(temp.toJSON());
                }
            });
        });

        // Grab Requirements
        let menuRequirements = [];
        if ( menuRequirementComponent != undefined && menuRequirementComponent.content != "" ) {
            menuRequirements = Array.from(menuRequirementComponent.content.matchAll(RoleMentionRegEx), (m) => m[0]);
        }

        // Create timestamp for when Interaction expires
        //   Mainly because we can't use the Interaction after it expires
        let now = Date.now();
        let in15Minutes = now + 900000;
        let timestampFor15Minutes = `<t:${Math.floor(in15Minutes / 1000)}:R>`;


        // Create new Cache item
        UtilityCollections.RoleMenuManagement.set(UserId, {
            sourceMessageId: interaction.data.target_id,
            interactionId: interaction.id,
            interactionToken: interaction.token,
            selectMenu: SelectMenu,
            menuEmbed: menuEmbedBuilder,
            menuButtons: menuButtonBuilders,
            roleRequirements: menuRequirements,
            mainInstructions: localize(interaction.locale, 'ROLE_MENU_CONFIGURATION_INTRUCTIONS', timestampFor15Minutes)
        });


        // ACK so User can actually edit the Menu!
        //   (After JSONifying stuff first)
        let embedJson = menuEmbedBuilder.toJSON();
        menuComponentsJson.push(SelectMenu.toJSON());

        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.Ephemeral,
                content: localize(interaction.locale, 'ROLE_MENU_CONFIGURATION_INTRUCTIONS', timestampFor15Minutes),
                embeds: [embedJson],
                components: menuComponentsJson
            }
        });
    }
}
