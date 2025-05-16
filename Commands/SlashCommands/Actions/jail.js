import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, MessageFlags, InteractionResponseType, ApplicationCommandOptionType, ComponentType, ButtonStyle } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { IMAGE_JAIL_CELLBARS } from '../../../Assets/Hyperlinks.js';


export const SlashCommand = {
    /** Command's Name, in fulllowercase (can include hyphens)
     * @type {String}
     */
    name: "jail",

    /** Command's Description
     * @type {String}
     */
    description: "Send someone to jail!",

    /** Command's Localised Descriptions
     * @type {import('discord-api-types/v10').LocalizationMap}
     */
    localizedDescriptions: {
        'en-GB': 'Send someone to jail!',
        'en-US': 'Send someone to jail!'
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
        "exampleName": 3
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
        CommandData.integration_types = [ ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall ];
        // Contexts - 0 for GUILD, 1 for BOT_DM (DMs with the App), 2 for PRIVATE_CHANNEL (DMs/GDMs that don't include the App).
        //  MUST include at least one. PRIVATE_CHANNEL can only be used if integration_types includes USER_INSTALL
        CommandData.contexts = [ InteractionContextType.Guild, InteractionContextType.PrivateChannel ];
        // Options
        CommandData.options = [
            {
                type: ApplicationCommandOptionType.User,
                name: "target",
                description: "The user to throw in jail",
                description_localizations: {
                    'en-GB': "The user to throw in jail",
                    'en-US': "The user to throw in jail"
                },
                required: true
            },
            {
                type: ApplicationCommandOptionType.String,
                name: "reason",
                description: "An optional custom reason to be added onto the end of the displayed message",
                description_localizations: {
                    'en-GB': "An optional custom reason to be added onto the end of the displayed message",
                    'en-US': "An optional custom reason to be added onto the end of the displayed message"
                },
                required: false,
                max_length: 500
            },
            {
                type: ApplicationCommandOptionType.Boolean,
                name: "include-minigame",
                description: "Set to true to include the \"break free from jail\" buttons",
                description_localizations: {
                    'en-GB': "Set to true to include the \"break free from jail\" buttons",
                    'en-US': "Set to true to include the \"break free from jail\" buttons"
                },
                required: false
            },
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
        // Grab Inputs
        const InputTarget = interaction.data.options.find(option => option.name === "target");
        const InputReason = interaction.data.options.find(option => option.name === "reason");
        const InputIncludeMinigame = interaction.data.options.find(option => option.name === "include-minigame");

        // Prevent usage on self
        if ( InputTarget.value === interactionUser.id ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'ACTION_ERROR_CANNOT_JAIL_SELF')
                }
            });
        }


        // Grab display names
        let senderDisplayName = "";
        let targetDisplayName = "";

        if ( interaction.data.resolved.members != undefined && interaction.data.resolved.members[InputTarget.value].nick != null ) { targetDisplayName = interaction.data.resolved.members[InputTarget.value].nick; }
        else if ( interaction.data.resolved.members != undefined && interaction.data.resolved.members[InputTarget.value].nick == null && interaction.data.resolved.users[InputTarget.value].global_name != null ) { targetDisplayName = interaction.data.resolved.users[InputTarget.value].global_name; }
        else if ( interaction.data.resolved.members != undefined && interaction.data.resolved.members[InputTarget.value].nick == null && interaction.data.resolved.users[InputTarget.value].global_name == null ) { targetDisplayName = interaction.data.resolved.users[InputTarget.value].username; }
        else if ( interaction.data.resolved.members == undefined && interaction.data.resolved.users[InputTarget.value].global_name != null ) { targetDisplayName = interaction.data.resolved.users[InputTarget.value].global_name; }
        else { targetDisplayName = interaction.data.resolved.users[InputTarget.value].username; }

        if ( interaction.member != undefined && interaction.member.nick != null ) { senderDisplayName = interaction.member.nick; }
        else if ( interaction.member != undefined && interaction.member.nick == null && interaction.member.user.global_name != null ) { senderDisplayName = interaction.member.user.global_name; }
        else if ( interaction.member != undefined && interaction.member.nick == null && interaction.member.user.global_name == null ) { senderDisplayName = interaction.member.user.username; }
        else if ( interaction.user != undefined && interaction.user.global_name != null ) { senderDisplayName = interaction.user.global_name; }
        else if ( interaction.user != undefined ) { senderDisplayName = interaction.user.username; }


        // Arrange into Components for display
        /** @type {import('discord-api-types/v10').APIMessageTopLevelComponent[]} */
        let displayComponents = [{
            "id": 1,
            "type": ComponentType.Section,
            "accessory": {
                "type": ComponentType.Thumbnail,
                "media": { "url": IMAGE_JAIL_CELLBARS }
            },
            "components": [{
                "id": 2,
                "type": ComponentType.TextDisplay,
                "content": `\u200B`
            }, {
                "id": 3,
                "type": ComponentType.TextDisplay,
                "content": `${localize(interaction.locale, 'ACTION_COMMAND_OTHER_USER_JAIL', targetDisplayName, senderDisplayName)}${InputReason != undefined ? ` ${InputReason.value}` : ''}`
            }]
        }];

        // Version with minigame buttons included
        /** @type {import('discord-api-types/v10').APIMessageTopLevelComponent[]} */
        let displayMinigameComponents = [{
            "id": 1,
            "type": ComponentType.Container,
            "spoiler": false,
            "components": [
                {
                    "id": 2,
                    "type": ComponentType.Section,
                    "accessory": {
                        "type": ComponentType.Thumbnail,
                        "media": { "url": IMAGE_JAIL_CELLBARS }
                    },
                    "components": [{
                        "id": 3,
                        "type": ComponentType.TextDisplay,
                        "content": `\u200B`
                    }, {
                        "id": 4,
                        "type": ComponentType.TextDisplay,
                        "content": `${localize(interaction.locale, 'ACTION_COMMAND_OTHER_USER_JAIL', targetDisplayName, senderDisplayName)}${InputReason != undefined ? ` ${InputReason.value}` : ''}`
                    }]
                },
                {
                    "id": 5,
                    "type": ComponentType.ActionRow,
                    "components": [
                        {
                            "id": 6,
                            "type": ComponentType.Button,
                            "style": ButtonStyle.Secondary,
                            "custom_id": `jail_ba_${targetDisplayName}_${InputTarget.value}_${senderDisplayName}`,
                            "label": localize(interaction.locale, 'ACTION_JAIL_MINIGAME_BAIL_BUTTON_LABEL')
                        },
                        {
                            "id": 7,
                            "type": ComponentType.Button,
                            "style": ButtonStyle.Secondary,
                            "custom_id": `jail_br_${targetDisplayName}_${InputTarget.value}_${senderDisplayName}`,
                            "label": localize(interaction.locale, 'ACTION_JAIL_MINIGAME_BREAKOUT_BUTTON_LABEL')
                        }
                    ]
                }
            ]
        }];

        // ACK
        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.IsComponentsV2,
                components: InputIncludeMinigame.value === true ? displayMinigameComponents : displayComponents,
                allowed_mentions: { parse: [] }
            }
        });
    }
}
