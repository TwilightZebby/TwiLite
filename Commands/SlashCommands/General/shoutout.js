import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, MessageFlags, InteractionResponseType, PermissionFlagsBits, ApplicationCommandOptionType, ComponentType } from 'discord-api-types/v10';
import { JsonResponse, hexToRgb, rgbArrayToInteger } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';


export const SlashCommand = {
    /** Command's Name, in fulllowercase (can include hyphens)
     * @type {String}
     */
    name: "shoutout",

    /** Command's Description
     * @type {String}
     */
    description: "Give another User in chat a Shout-out, highlighting them to others",

    /** Command's Localised Descriptions
     * @type {import('discord-api-types/v10').LocalizationMap}
     */
    localizedDescriptions: {
        'en-GB': 'Give another User in chat a Shout-out, highlighting them to others',
        'en-US': 'Give another User in chat a Shout-out, highlighting them to others'
    },

    /** Command's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 60,

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
        // Default Permission Requirement
        CommandData.default_member_permissions = String(PermissionFlagsBits.PinMessages);
        // Options
        CommandData.options = [{
            type: ApplicationCommandOptionType.User,
            name: "user",
            description: "The User you want to shout-out",
            description_localizations: {
                'en-GB': "The User you want to shout-out",
                'en-US': "The User you want to shout-out"
            },
            required: true
        }, {
            type: ApplicationCommandOptionType.String,
            name: "reason",
            description: "OPTIONAL - The reason for this shout-out",
            description_localizations: {
                'en-GB': "OPTIONAL - The reason for this shout-out",
                'en-US': "OPTIONAL - The reason for this shout-out"
            },
            required: false,
            max_length: 250
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
        // Grab inputs
        const InputUser = interaction.data.options.find(item => item.type === ApplicationCommandOptionType.User);
        const ResolvedUser = interaction.data.resolved?.users?.[InputUser.value];
        const ReceivingUserDisplayName = ResolvedUser.global_name ?? ResolvedUser.username;
        const InputReason = interaction.data.options.find(item => item.type === ApplicationCommandOptionType.String);

        let receivingUserAvatarUri = `https://cdn.discordapp.com/embed/avatars/${(InputUser.value >> 22) % 6}`;
        
        if ( ResolvedUser.avatar != null ) {
            if ( ResolvedUser.avatar.startsWith("a_") ) { receivingUserAvatarUri = `https://cdn.discordapp.com/avatars/${InputUser.value}/${ResolvedUser.avatar}.gif`; }
            else { receivingUserAvatarUri = `https://cdn.discordapp.com/avatars/${InputUser.value}/${ResolvedUser.avatar}.png`; }
        }

        let currentLocale = interaction.guild_locale ?? interaction.locale;


        // Validate target user isn't the same as interaction user
        if ( InputUser.value === interactionUser.id ) {
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'SHOUTOUT_COMMAND_ERROR_CANNOT_SHOUTOUT_SELF')
                }
            });
        }


        // Construct public output
        /** @type {import('discord-api-types/v10').APIMessageTopLevelComponent[]} */
        let responseComponents = [{
            type: ComponentType.Container,
            accent_color: rgbArrayToInteger(hexToRgb('#dadd12')),
            spoiler: false,
            components: [{
                type: ComponentType.Section,
                accessory: {
                    type: ComponentType.Thumbnail,
                    media: { url: receivingUserAvatarUri },
                    spoiler: false,
                    description: localize(currentLocale, 'SHOUTOUT_COMMAND_RESPONSE_AVATAR_ALT_TEXT', `@${ReceivingUserDisplayName}`)
                },
                components: [{
                    type: ComponentType.TextDisplay,
                    content: `# ${localize(currentLocale, 'SHOUTOUT_COMMAND_RESPONSE_HEADING')}\n${localize(currentLocale, 'SHOUTOUT_COMMAND_RESPONSE_DESCRIPTION', `<@${interactionUser.id}>`, `<@${InputUser.value}>`)}${InputReason != undefined ? `\n\`\`\`\n${InputReason.value}\n\`\`\`` : ""}`
                }]
            }]
        }];


        // ACK
        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.IsComponentsV2,
                components: responseComponents,
                allowed_mentions: { parse: [], users: [ InputUser.value ] }
            }
        });
    }
}
