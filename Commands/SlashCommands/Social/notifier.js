import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, InteractionResponseType, PermissionFlagsBits, ApplicationCommandOptionType, MessageFlags, ComponentType, ButtonStyle } from 'discord-api-types/v10';
import { listTwitchNotifications } from '../../../Modules/Notifications/TwitchNotifications.js';
import { checkForInfernoSku, JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { SKU_INFERNO_ID } from '../../../config.js';


export const SlashCommand = {
    /** Command's Name, in fulllowercase (can include hyphens)
     * @type {String}
     */
    name: "notifier",

    /** Command's Description
     * @type {String}
     */
    description: "Manage the Notification Module in this Server",

    /** Command's Localised Descriptions
     * @type {import('discord-api-types/v10').LocalizationMap}
     */
    localizedDescriptions: {
        'en-GB': 'Manage the Notification Module in this Server',
        'en-US': 'Manage the Notification Module in this Server'
    },

    /** Command's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 5,

    /**
     * Cooldowns for specific Subcommands
     */
    // Where "exampleName" is either the Subcommand's Name, or a combo of both Subcommand Group Name and Subcommand Name
    //  For ease in handling cooldowns, this should also include the root Command name as a prefix
    // In either "rootCommandName_subcommandName" or "rootCommandName_groupName_subcommandName" formats
    subcommandCooldown: {
        "notifier_twitch": 3
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
        // Default Permissions
        CommandData.default_member_permissions = String(PermissionFlagsBits.ManageGuild);
        // Options
        CommandData.options = [{
            type: ApplicationCommandOptionType.Subcommand,
            name: "twitch",
            description: "Manage Twitch Notifications for this Server",
            description_localizations: {
                'en-GB': "Manage Twitch Notifications for this Server",
                'en-US': "Manage Twitch Notifications for this Server"
            }
        }];

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
     * @param {*} cfEnv 
     */
    async executeCommand(interaction, interactionUser, usedCommandName, cfEnv) {
        const InputSubcommand = interaction.data.options.find(option => option.type === ApplicationCommandOptionType.Subcommand);

        if ( InputSubcommand.name === "twitch" ) {
            // Do the Premium Early Access check first
            let hasInferno = checkForInfernoSku(interaction);

            if ( hasInferno === false ) {
                return new JsonResponse({
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
                        /** @type {import('discord-api-types/v10').APIMessageTopLevelComponent[]} */
                        components: [{
                            type: ComponentType.TextDisplay,
                            content: localize(interaction.locale, 'TWITCH_NOTIF_PREMIUM_EARLY_ACCESS')
                        }, {
                            type: ComponentType.ActionRow,
                            components: [{
                                type: ComponentType.Button,
                                style: ButtonStyle.Premium,
                                sku_id: SKU_INFERNO_ID
                            }]
                        }]
                    }
                });
            }

            return await listTwitchNotifications(interaction, cfEnv, 'NEW');
        }
    }
}
