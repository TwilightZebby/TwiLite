import { Collection } from '@discordjs/collection';
import { EmbedBuilder, ButtonBuilder, ActionRowBuilder } from '@discordjs/builders';


// *******************************
//  Exports

/** Utility & Command/Interaction Collections */
export const UtilityCollections = {
    /** Holds all Cooldowns for Slash Commands, mapped by "commandName_userID"
     * @type {Collection<String, Number>} 
     */
    SlashCooldowns: new Collection(),

    /** Holds all Cooldowns for Context Commands, mapped by "commandName_userID"
     * @type {Collection<String, Number>} 
     */
    ContextCooldowns: new Collection(),

    /** Holds all Cooldowns for Button Interactions, mapped by "buttonName_userID"
     * @type {Collection<String, Number>} 
     */
    ButtonCooldowns: new Collection(),

    /** Holds all Cooldowns for Select Menu Interactions, mapped by "selectName_userID"
     * @type {Collection<String, Number>}
     */
    SelectCooldowns: new Collection(),

    /** Temp-stores Interaction IDs && Tokens for use in editing/deleting messages during Role Menu Management. Also caches Buttons & Embed during Menu management.
     *  Collection<userId, {sourceMessageId, interactionId, interactionToken, selectMenu, menuEmbed, menuButtons, roleRequirements, mainInstructions}>
     * @type {Collection<String, {sourceMessageId: ?String, interactionId: String, interactionToken: String, selectMenu: ActionRowBuilder, menuEmbed: EmbedBuilder, menuButtons: Array<ButtonBuilder>, roleRequirements: Array<String>, mainInstructions: String}>}
     */
    RoleMenuManagement: new Collection()
};

/** RegEx for Role Mentions */
export const RoleMentionRegEx = new RegExp(/<@&(\d{17,20})>/g);

/** RegEx for Discord Custom Emoji */
export const DiscordEmojiRegex = new RegExp(/<a?:(?<name>[a-zA-Z0-9\_]+):(?<id>\d{15,21})>/);

/** RegEx for Hex Colour Codes */
export const HexColourRegex = new RegExp(/#[0-9a-fA-F]{6}/);

/** Endpoint for sending Messages (outside of Interactions)
 * @param channelId ID of the Channel to create a new Message in
 * 
 * @note Uses POST Calls
 */
export const CreateMessageEndpoint = (channelId) => `https://discord.com/api/v10/channels/${channelId}/messages`;

/** Endpoint for editing Messages (outside of Interactions)
 * @param channelId ID of the Channel the Message is in
 * @param messageId ID of the Message to edit
 * 
 * @note Use PATCH to edit - DELETE to delete
 */
export const ManageMessageEndpoint = (channelId, messageId) => `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`;

/** Endpoint for creating Interaction Responses
 * @param interactionId {String} ID of the Interaction to respond to
 * @param interactionToken {String} Token of the Interaction to respond to
 * 
 * @note Uses POST Calls
 */
export const CreateInteractionResponseEndpoint = (interactionId, interactionToken) => `https://discord.com/api/v10/interactions/${interactionId}/${interactionToken}/callback`;

/** Endpoint for getting, editing, or deleting ORIGINAL Interaction Responses
 * @param applicationId {String} ID of the Application that sent the Interaction Response
 * @param interactionToken {String} Token of the Interaction to get/edit/delete its Response of
 * 
 * @note Use GET to fetch - PATCH to edit - DELETE to delete
 */
export const OriginalInteractionResponseEndpoint = (applicationId, interactionToken) => `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}/messages/@original`;

/** Endpoint for creating a Followup Response to an Interaction
 * @param applicationId {String} ID of the Application to send a Followup Response for
 * @param interactionToken {String} Token of the original Interaction to followup
 * 
 * @note Uses POST Calls
 */
export const CreateInteractionFollowupEndpoint = (applicationId, interactionToken) => `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}`;
