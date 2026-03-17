import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, MessageFlags, InteractionResponseType, ComponentType } from 'discord-api-types/v10';
import { JsonResponse, fetchInteractionUserDisplayName, hexToRgb, randomNumberInRange, rgbArrayToInteger } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';


const FishItems = [ "COD", "EEL", "HADDOCK", "SQUID", "PUFFERFISH", "CLOWNFISH", "TROPICAL", "SALMON", "AXOLOTL" ];
const JunkItems = [ "TRASH", "BONE", "STONE", "STICK", "NET", "NITRO" ];
const TreasureItems = [ "GOLD", "COIN", "CHEST", "JEWELLERY", "DIAMOND" ];


export const SlashCommand = {
    /** Command's Name, in fulllowercase (can include hyphens)
     * @type {String}
     */
    name: "fish",

    /** Command's Description
     * @type {String}
     */
    description: "Cast out a fishing line to see what you reel in!",

    /** Command's Localised Descriptions
     * @type {import('discord-api-types/v10').LocalizationMap}
     */
    localizedDescriptions: {
        'en-GB': 'Cast out a fishing line to see what you reel in!',
        'en-US': 'Cast out a fishing line to see what you reel in!'
    },

    /** Command's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 8,

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
        // Generate a random number to decide on what is fished out
        let randomNumber = randomNumberInRange(0, 11);

        // Construct start of response components
        /** @type {import('discord-api-types/v10').APIMessageTopLevelComponent[]} */
        let responseComponents = [{
            "type": ComponentType.Container,
            "spoiler": false,
            "components": [{
                "type": ComponentType.TextDisplay,
                "content": localize(interaction.guild_locale ?? interaction.locale, 'FISH_COMMAND_HEADING')
            }]
        }];

        // Grab highest-level display name of user
        let grabUsersName = fetchInteractionUserDisplayName(interaction);

        // Fished nothing
        if ( randomNumber >= 0 && randomNumber <= 1 ) {
            responseComponents[0].components.push({
                "type": ComponentType.TextDisplay,
                "content": localize(interaction.guild_locale ?? interaction.locale, 'FISH_COMMAND_USER_WENT_FISHING', grabUsersName, localize(interaction.guild_locale ?? interaction.locale, 'FISH_COMMAND_ITEM_NOTHING'))
            }, {
                "type": ComponentType.TextDisplay,
                "content": localize(interaction.guild_locale ?? interaction.locale, 'FISH_COMMAND_FISHED_CATEGORY', localize(interaction.guild_locale ?? interaction.locale, 'FISH_COMMAND_CATEGORY_NOTHING'))
            });
        }
        // Fished an actual fish
        else if ( (randomNumber >= 2 && randomNumber <= 6) || randomNumber === 11 ) {
            let randomFishItem = FishItems[Math.floor((Math.random() * FishItems.length) + 0)];

            responseComponents[0].accent_color = rgbArrayToInteger(hexToRgb("#54b0db"));

            responseComponents[0].components.push({
                "type": ComponentType.TextDisplay,
                "content": localize(interaction.guild_locale ?? interaction.locale, 'FISH_COMMAND_USER_WENT_FISHING', grabUsersName, localize(interaction.guild_locale ?? interaction.locale, `FISH_COMMAND_ITEM_FISH_${randomFishItem}`))
            }, {
                "type": ComponentType.TextDisplay,
                "content": localize(interaction.guild_locale ?? interaction.locale, 'FISH_COMMAND_FISHED_CATEGORY', localize(interaction.guild_locale ?? interaction.locale, 'FISH_COMMAND_CATEGORY_FISH'))
            });
        }
        // Fished junk
        else if ( randomNumber >= 7 && randomNumber <= 8 ) {
            let randomJunkItem = JunkItems[Math.floor((Math.random() * JunkItems.length) + 0)];

            responseComponents[0].accent_color = rgbArrayToInteger(hexToRgb("#852e54"));

            responseComponents[0].components.push({
                "type": ComponentType.TextDisplay,
                "content": localize(interaction.guild_locale ?? interaction.locale, 'FISH_COMMAND_USER_WENT_FISHING', grabUsersName, localize(interaction.guild_locale ?? interaction.locale, `FISH_COMMAND_ITEM_JUNK_${randomJunkItem}`))
            }, {
                "type": ComponentType.TextDisplay,
                "content": localize(interaction.guild_locale ?? interaction.locale, 'FISH_COMMAND_FISHED_CATEGORY', localize(interaction.guild_locale ?? interaction.locale, 'FISH_COMMAND_CATEGORY_JUNK'))
            });
        }
        // Fished treasure
        else if ( randomNumber === 9 ) {
            let randomTreasureItem = TreasureItems[Math.floor((Math.random() * TreasureItems.length) + 0)];

            responseComponents[0].accent_color = rgbArrayToInteger(hexToRgb("#bac518"));

            responseComponents[0].components.push({
                "type": ComponentType.TextDisplay,
                "content": localize(interaction.guild_locale ?? interaction.locale, 'FISH_COMMAND_USER_WENT_FISHING', grabUsersName, localize(interaction.guild_locale ?? interaction.locale, `FISH_COMMAND_ITEM_TREASURE_${randomTreasureItem}`))
            }, {
                "type": ComponentType.TextDisplay,
                "content": localize(interaction.guild_locale ?? interaction.locale, 'FISH_COMMAND_FISHED_CATEGORY', localize(interaction.guild_locale ?? interaction.locale, 'FISH_COMMAND_CATEGORY_TREASURE'))
            });
        }
        // Fished oneself!
        else {
            responseComponents[0].accent_color = rgbArrayToInteger(hexToRgb("#c318c5"));

            responseComponents[0].components.push({
                "type": ComponentType.TextDisplay,
                "content": localize(interaction.guild_locale ?? interaction.locale, 'FISH_COMMAND_USER_WENT_FISHING', grabUsersName, localize(interaction.guild_locale ?? interaction.locale, 'FISH_COMMAND_ITEM_SELF'))
            }, {
                "type": ComponentType.TextDisplay,
                "content": localize(interaction.guild_locale ?? interaction.locale, 'FISH_COMMAND_FISHED_CATEGORY', localize(interaction.guild_locale ?? interaction.locale, 'FISH_COMMAND_CATEGORY_SELF'))
            });
        }


        return new JsonResponse({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                flags: MessageFlags.IsComponentsV2,
                components: responseComponents,
                allowed_mentions: { parse: [] }
            }
        });
    }
}
