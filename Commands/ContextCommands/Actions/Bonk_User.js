import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, MessageFlags, InteractionResponseType } from 'discord-api-types/v10';
import { JsonResponse } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { DISCORD_APP_USER_ID } from '../../../config.js';


export const ContextCommand = {
    /** Command's Name, supports both upper- and lower-case, and spaces
     * @type {String}
     */
    name: "Bonk User",

    /** Command's Description
     * @type {String}
     */
    description: "Bonk the User for being naughty!",

    /** Type of Context Command
     * @type {ApplicationCommandType}
     */
    commandType: ApplicationCommandType.User,

    /** Command's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 3,
    

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
        CommandData.integration_types = [ ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall ];
        // Contexts - 0 for GUILD, 1 for BOT_DM (DMs with the App), 2 for PRIVATE_CHANNEL (DMs/GDMs that don't include the App).
        //  MUST include at least one. PRIVATE_CHANNEL can only be used if integration_types includes USER_INSTALL
        CommandData.contexts = [ InteractionContextType.Guild, InteractionContextType.PrivateChannel ];

        return CommandData;
    },

    /** Runs the Command
     * @param {import('discord-api-types/v10').APIUserApplicationCommandGuildInteraction|import('discord-api-types/v10').APIUserApplicationCommandDMInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeCommand(interaction, interactionUser) {
        // Grab data
        const TargetUser = interaction.data.resolved.users[interaction.data.target_id];
        const TargetMember = interaction.data.resolved.members != undefined ? interaction.data.resolved.members[interaction.data.target_id] : undefined;
        
        // Get highest-level display name for Target
        const TargetDisplayName = TargetMember != undefined && TargetMember.nick != null ? TargetMember.nick
            : TargetMember != undefined && TargetMember.nick == null && TargetUser.global_name != null ? TargetUser.global_name
            : TargetMember == undefined && TargetUser.global_name != null ? TargetUser.global_name
            : TargetUser.username;

        // Do the same, but for User who triggered this Command
        const SenderDisplayName = interaction.member != undefined && interaction.member.nick != null ? interaction.member.nick
            : interaction.member != undefined && interaction.member.nick == null && interaction.member.user.global_name != null ? interaction.member.user.global_name
            : interaction.member != undefined && interaction.member.nick == null && interaction.member.user.global_name == null ? interaction.member.user.username
            : interaction.member == undefined && interaction.user.global_name != null ? interaction.user.global_name
            : interaction.user.username;
        const SenderId = interaction.member != undefined ? interaction.member.user.id : interaction.user.id;


        // Assemble message
        let displayMessage = "";

        // Used on self
        if ( interaction.data.target_id === SenderId ) {
            displayMessage = localize(interaction.locale, 'ACTION_COMMAND_SELF_USER_BONK', SenderDisplayName);
        }
        // Used on this App
        else if ( interaction.data.target_id === DISCORD_APP_USER_ID ) {
            displayMessage = localize(interaction.locale, 'ACTION_COMMAND_TWILITE_BONK', SenderDisplayName);
        }
        // Used on Mee6, that yucky App that should be unverified :c
        else if ( interaction.data.target_id === "159985870458322944" ) {
            displayMessage = localize(interaction.locale, 'ACTION_COMMAND_MEE6_BONK', SenderDisplayName, `<@159985870458322944>`);
        }
        // Used on any other App
        else if ( TargetUser.bot || TargetMember?.user?.bot ) {
            displayMessage = localize(interaction.locale, 'ACTION_COMMAND_OTHER_APPS_BONK', SenderDisplayName, TargetDisplayName)
        }
        // Used on any non-App User
        else {
            displayMessage = localize(interaction.locale, 'ACTION_COMMAND_OTHER_USER_BONK', SenderDisplayName, TargetDisplayName);
        }

        // ACK message
        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: displayMessage,
                allowed_mentions: { parse: [] }
            }
        });
    }
}
