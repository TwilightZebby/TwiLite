import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, MessageFlags, InteractionResponseType, PermissionFlagsBits, ApplicationCommandOptionType, ChannelType } from 'discord-api-types/v10';
import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from '@discordjs/builders';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';


export const SlashCommand = {
    /** Command's Name, in fulllowercase (can include hyphens)
     * @type {String}
     */
    name: "rolemenu",

    /** Command's Description
     * @type {String}
     */
    description: "Use to manage self-assignable Role Menus",

    /** Command's Localised Descriptions
     * @type {import('discord-api-types/v10').LocalizationMap}
     */
    localizedDescriptions: {
        'en-GB': 'Use to manage self-assignable Role Menus',
        'en-US': 'Use to manage self-assignable Role Menus'
    },

    /** Command's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 10,

    /**
     * Cooldowns for specific Subcommands
     */
    // Where "exampleName" is either the Subcommand's Name, or a combo of both Subcommand Group Name and Subcommand Name
    //  For ease in handling cooldowns, this should also include the root Command name as a prefix
    // In either "rootCommandName_subcommandName" or "rootCommandName_groupName_subcommandName" formats
    subcommandCooldown: {
        "rolemenu_create": 10,
        "rolemenu_edit": 5,
        "rolemenu_delete": 5
    },
    

    /** Get the Command's data in a format able to be registered with via Discord's API
     * @returns {import('discord-api-types/v10').RESTPostAPIApplicationCommandsJSONBody}
     */
    getRegisterData() {
        /** @type {import('discord-api-types/v10').RESTPostAPIApplicationCommandsJSONBody} */
        const CommandData = {};

        CommandData.name = this.name;
        CommandData.description = this.description;
        CommandData.description_localizations = this.localizedDescriptions;
        CommandData.type = ApplicationCommandType.ChatInput;
        // Integration Types - 0 for GUILD_INSTALL, 1 for USER_INSTALL.
        //  MUST include at least one. 
        CommandData.integration_types = [ ApplicationIntegrationType.GuildInstall ];
        // Contexts - 0 for GUILD, 1 for BOT_DM (DMs with the App), 2 for PRIVATE_CHANNEL (DMs/GDMs that don't include the App).
        //  MUST include at least one. PRIVATE_CHANNEL can only be used if integration_types includes USER_INSTALL
        CommandData.contexts = [ InteractionContextType.Guild ];
        CommandData.default_member_permissions = `${PermissionFlagsBits.ManageGuild}`;
        CommandData.options = [
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "create",
                description: "Create a new self-assignable Role Menu",
                description_localizations: {
                    'en-GB': "Create a new self-assignable Role Menu",
                    'en-US': "Create a new self-assignable Role Menu"
                }
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "edit",
                description: "Shows how to edit an existing Role Menu",
                description_localizations: {
                    'en-GB': "Shows how to edit an existing Role Menu",
                    'en-US': "Shows how to edit an existing Role Menu"
                }
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "delete",
                description: "Shows how to delete an existing Role Menu",
                description_localizations: {
                    'en-GB': "Shows how to delete an existing Role Menu",
                    'en-US': "Shows how to delete an existing Role Menu"
                }
            }
        ];

        return CommandData;
    },

    /** Handles given Autocomplete Interactions, should this Command use Autocomplete Options
     * @param {import('discord-api-types/v10').APIApplicationCommandAutocompleteInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async handleAutoComplete(interaction, interactionUser) {
        return new JsonResponse({
            type: InteractionResponseType.ApplicationCommandAutocompleteResult,
            data: {
                choices: [ {name: "Not implemented yet!", value: "NOT_IMPLEMENTED"} ]
            }
        });
    },

    /** Runs the Command
     * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     * @param {String} usedCommandName 
     */
    async executeCommand(interaction, interactionUser, usedCommandName) {
        // Ensure this was used within supported Channel Types
        if ( interaction.channel.type !== ChannelType.GuildText ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'ROLE_MENU_ERROR_INVALID_CHANNEL')
                }
            });
        }

        // Ensure App has MANAGE_ROLES Permission
        let appPerms = BigInt(interaction.app_permissions);
        if ( !((appPerms & PermissionFlagsBits.ManageRoles) == PermissionFlagsBits.ManageRoles) ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'ROLE_MENU_ERROR_MISSING_MANAGE_ROLES_PERMISSION')
                }
            });
        }


        // Grab Subcommand used
        const InputSubcommand = interaction.data.options.find(option => option.type === ApplicationCommandOptionType.Subcommand);

        // ***** CREATE A NEW ROLE MENU
        if ( InputSubcommand.name === "create" ) {
            // First, ensure App has SEND_MESSAGES Permission
            if ( !((appPerms & PermissionFlagsBits.SendMessages) == PermissionFlagsBits.SendMessages)) {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral,
                        content: localize(interaction.locale, 'ROLE_MENU_ERROR_MISSING_SEND_MESSAGES_PERMISSION')
                    }
                });
            }


            // Create localized components
            const EmptyEmbed = new EmbedBuilder().setDescription(localize(interaction.locale, 'ROLE_MENU_PREVIEW_EMPTY'));

            const SelectMenu = new ActionRowBuilder().addComponents([
                new StringSelectMenuBuilder().setCustomId(`create-role-menu`).setMinValues(1).setMaxValues(1).setPlaceholder(localize(interaction.locale, 'ROLE_MENU_SELECT_AN_ACTION')).setOptions([
                    new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_SET_MENU_TYPE')).setValue("set-type").setDescription(localize(interaction.locale, 'ROLE_MENU_SET_MENU_TYPE_DESCRIPTION')).setEmoji({ name: `🔧` }),
                    new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_CONFIGURE_EMBED')).setValue("configure-embed").setDescription(localize(interaction.locale, 'ROLE_MENU_CONFIGURE_EMBED_DESCRIPTION')).setEmoji({ name: `StatusRichPresence`, id: `842328614883295232` }),
                    new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_ADD_ROLE')).setValue("add-role").setDescription(localize(interaction.locale, 'ROLE_MENU_ADD_ROLE_DESCRIPTION')).setEmoji({ name: `RoleAdd`, id: `1201474746810904607` }),
                    new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_REMOVE_ROLE')).setValue("remove-role").setDescription(localize(interaction.locale, 'ROLE_MENU_REMOVE_ROLE_DESCRIPTION')).setEmoji({ name: `RoleRemove`, id: `1201476372997079040` }),
                    new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_ADD_REQUIREMENT')).setValue("add-requirement").setDescription(localize(interaction.locale, 'ROLE_MENU_ADD_REQUIREMENT_DESCRIPTION')).setEmoji({ name: `RequirementAdd`, id: `1201477187522531348` }),
                    new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_REMOVE_REQUIREMENT')).setValue("remove-requirement").setDescription(localize(interaction.locale, 'ROLE_MENU_REMOVE_REQUIREMENT_DESCRIPTION')).setEmoji({ name: `RequirementRemove`, id: `1201477188306878540` }),
                    new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_SAVE_AND_POST')).setValue("save").setDescription(localize(interaction.locale, 'ROLE_MENU_SAVE_AND_POST_DESCRIPTION')).setEmoji({ name: `IconActivity`, id: `815246970457161738` }),
                    new StringSelectMenuOptionBuilder().setLabel(localize(interaction.locale, 'ROLE_MENU_CANCEL_CREATION')).setValue("cancel").setDescription(localize(interaction.locale, 'ROLE_MENU_CANCEL_CREATION_DESCRIPTION')).setEmoji({ name: `❌`})
                ])
            ]);

            // JSONify for ACKing
            let embedJson = EmptyEmbed.toJSON();
            let selectJson = SelectMenu.toJSON();

            // ACK
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'ROLE_MENU_CREATE_INTRUCTIONS'),
                    components: [selectJson],
                    embeds: [embedJson]
                }
            });



        }
        // ***** EDIT AN EXISTING ROLE MENU
        else if ( InputSubcommand.name === "edit" ) {
            //.



        }
        // ***** DELETE AN EXISTING ROLE MENU
        else {
            //.


            
        }

        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.Ephemeral,
                content: "TEST"
            }
        });
    }
}
