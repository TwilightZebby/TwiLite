import { Collection } from '@discordjs/collection';


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

    /** Temp-stores Interaction Tokens for use in editing/deleting messages during Role Menu Management. Collection<userId, interactionToken>
     * @type {Collection<String, String>}
     */
    RoleMenuManagement: new Collection()
};

/** RegEx for Role Mentions */
export const RoleMentionRegEx = new RegExp(/<@&(\d{17,20})>/g);

/** Endpoint for sending Messages (outside of Interactions)
 * @param channelId ID of the Channel to create a new Message in
 * 
 * @note Uses POST Calls
 */
export const CreateMessageEndpoint = (channelId) => `https://discord.com/api/v10/channels/${channelId}/messages`;

/** Endpoint for getting, editing, or deleting ORIGINAL Interaction Responses
 * @param applicationId ID of the Application that sent the Interaction Response
 * @param interactionToken Token of the Interaction to get/edit/delete its Response of
 * 
 * @note Use GET to fetch - PATCH to edit - DELETE to delete
 */
export const OriginalInteractionResponseEndpoint = (applicationId, interactionToken) => `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}/messages/@original`;
