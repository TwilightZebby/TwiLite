import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, MessageFlags, InteractionResponseType, PermissionFlagsBits, ButtonStyle } from 'discord-api-types/v10';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from '@discordjs/builders';
import { JsonResponse, hexToRgb } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { DISCORD_TOKEN } from '../../../config.js';


/** Endpoint for sending Messages (outside of Interactions) */
const CreateMessageEndpoint = `https://discord.com/api/v10/channels/1255230926904889404/messages`;


export const SlashCommand = {
    /** Command's Name, in fulllowercase (can include hyphens)
     * @type {String}
     */
    name: "rolemenu",

    /** Command's Description
     * @type {String}
     */
    description: "TEMP - Posts pre-set Role Menus for TwilightZebby.",

    /** Command's Localised Descriptions
     * @type {import('discord-api-types/v10').LocalizationMap}
     */
    localizedDescriptions: {
        'en-GB': 'TEMP - Posts pre-set Role Menus for TwilightZebby.',
        'en-US': 'TEMP - Posts pre-set Role Menus for TwilightZebby.'
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
        CommandData.integration_types = [ ApplicationIntegrationType.GuildInstall ];
        // Contexts - 0 for GUILD, 1 for BOT_DM (DMs with the App), 2 for PRIVATE_CHANNEL (DMs/GDMs that don't include the App).
        //  MUST include at least one. PRIVATE_CHANNEL can only be used if integration_types includes USER_INSTALL
        CommandData.contexts = [ InteractionContextType.Guild ];
        CommandData.default_member_permissions = `${PermissionFlagsBits.ManageGuild}`;

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
        // Create Embeds & Buttons for Role Menus

        const NotifMenuEmbed = new EmbedBuilder()
            .setColor(hexToRgb('#296fba'))
            .setTitle(`Notification Roles`)
            .setDescription(`Want to toggle receiving \`@pings\` for certain things in this Server?\nFeel free to opt-in (or back out) using these Notification Roles.`)
            .addFields({ name: `\u200B`, value: `• <@&1255398985535979532> - Zebby's Posts\n• <@&1154663456260247662> - Server Updates` })
            .setFooter({ text: localize(interaction.guild_locale, 'ROLE_MENU_TYPE_FOOTER', `TOGGLE`) });
        let notifEmbedJson = NotifMenuEmbed.toJSON();

        const FeedToggleMenuEmbed = new EmbedBuilder()
            .setColor(hexToRgb('#205a99'))
            .setTitle(`Feed Toggles`)
            .setDescription(`Want to hide away any of the External Feed Channels?\nGrab one of these Roles to hide them from yourself.`)
            .addFields({ name: `\u200B`, value: `• <@&1307608757458440202> - Hide: Tumblr\n• <@&1307608904670253086> - Hide: App News` })
            .setFooter({ text: localize(interaction.guild_locale, 'ROLE_MENU_TYPE_FOOTER', `TOGGLE`) });
        let feedToggleEmbedJson = FeedToggleMenuEmbed.toJSON();
        
        const ColorMenuEmbed = new EmbedBuilder()
            .setColor(hexToRgb('#205a99'))
            .setTitle(`Colour Roles`)
            .setDescription(`Want to have a different name colour in this Server?\nFeel free to pick from one of the colours below:`)
            .addFields({ name: `\u200B`, value: `• <@&997591355658346507> - Yellow\n• <@&997591547585495130> - Red\n• <@&997591463502303395> - Green\n• <@&997591670835122186> - Blurple 1.0\n• <@&997591808785788988> - Blurple 2.0` })
            .setFooter({ text: localize(interaction.guild_locale, 'ROLE_MENU_TYPE_FOOTER', `SWAP`) });
        let colorEmbedJson = ColorMenuEmbed.toJSON();
        
        
        const NotifActionRow = new ActionRowBuilder().addComponents([
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`role_1255398985535979532`).setLabel(`Zebby's Posts`),
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`role_1154663456260247662`).setLabel(`Server Updates`),
        ]);
        let notifRowJson = NotifActionRow.toJSON();

        const FeedToggleActionRow = new ActionRowBuilder().addComponents([
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`role_1307608757458440202`).setLabel(`Hide: Tumblr`),
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`role_1307608904670253086`).setLabel(`Hide: App News`),
        ]);
        let feedToggleRowJson = FeedToggleActionRow.toJSON();

        const ColorActionRow = new ActionRowBuilder().addComponents([
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`role_997591355658346507`).setLabel(`Yellow`),
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`role_997591547585495130`).setLabel(`Red`),
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`role_997591463502303395`).setLabel(`Green`),
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`role_997591670835122186`).setLabel(`Blurple 1.0`),
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`role_997591808785788988`).setLabel(`Blurple 2.0`),
        ]);
        let colorRowJson = ColorActionRow.toJSON();


        // Send Menus into Channel
        await fetch(CreateMessageEndpoint, {
            headers: {
                'content-type': 'application/json',
                Authorization: `Bot ${DISCORD_TOKEN}`,
            },
            method: 'POST',
            body: {
                embeds: [notifEmbedJson],
                components: [notifRowJson]
            }
        });

        await fetch(CreateMessageEndpoint, {
            headers: {
                'content-type': 'application/json',
                Authorization: `Bot ${DISCORD_TOKEN}`,
            },
            method: 'POST',
            body: {
                embeds: [feedToggleEmbedJson],
                components: [feedToggleRowJson]
            }
        });

        await fetch(CreateMessageEndpoint, {
            headers: {
                'content-type': 'application/json',
                Authorization: `Bot ${DISCORD_TOKEN}`,
            },
            method: 'POST',
            body: {
                embeds: [colorEmbedJson],
                components: [colorRowJson]
            }
        });


        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.Ephemeral,
                content: "Boop!"
            }
        });
    }
}
