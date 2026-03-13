import { InteractionContextType, PermissionFlagsBits } from 'discord-api-types/v10';
import { Buffer } from 'node:buffer';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { DISCORD_APP_USER_ID, DISCORD_TOKEN, SKU_INFERNO_ID, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } from '../config.js';
import { DefaultDiscordRequestHeaders } from './utilityConstants.js';


// *******************************
//  Exports

/**
 * Checks the Tag/Discrim of the given APIUser, to see if they're on the new Username System or not.
 * 
 * Note: This shouldn't be used as much now that all non-App/Bot Users HAVE been fully migrated at this point
 * @param {import('discord-api-types/v10').APIUser} user 
 * 
 * @returns {Boolean} True if on the new Username System
 */
export function checkPomelo(user) {
    if ( user.discriminator === '0' ) { return true; }
    else { return false; }
}

/**
 * Returns the highest-level display name for the user triggering the Interaction.
 * This will grab one of the following (in order of preference): Server Nickname, User Global Display Name, User Username
 * @param {import('discord-api-types/v10').APIInteraction} interaction 
 * 
 * @returns {String}
 */
export function fetchInteractionUserDisplayName(interaction) {
  let highestName = interaction.member != undefined && interaction.member?.nick != null ? interaction.member.nick
    : interaction.member != undefined && interaction.member.nick == null && interaction.member.user.global_name != null ? interaction.member.user.global_name
    : interaction.member != undefined && interaction.member.nick == null && interaction.member.user.global_name == null ? interaction.member.user.username
    : interaction.member == undefined && interaction.user?.global_name != null ? interaction.user.global_name
    : interaction.user.username;

  return highestName;
}

/**
 * Checks if the App can use External Server Emojis in its Interaction responses
 * @param {import('discord-api-types/v10').APIInteraction} interaction 
 * 
 * @returns {Boolean} True if App does have USE_EXTERNAL_EMOJIS Permission
 */
export function checkExternalEmojiPermission(interaction) {
    let hasPermission = false;
    let appPermissions = BigInt(interaction.app_permissions);

    if ( (appPermissions & PermissionFlagsBits.UseExternalEmojis) == PermissionFlagsBits.UseExternalEmojis ) { hasPermission = true; }

    return hasPermission;
}

/**
 * Convert raw Guild Feature Flags into title case
 * @param {String} featureFlag
 * 
 * @returns {String}
 */
export function titleCaseGuildFeature(featureFlag) {
    return featureFlag.toLowerCase()
    .replace(/guild/, "server")
    .split("_")
    .map(subString => subString.charAt(0).toUpperCase() + subString.slice(1))
    .join(" ");
}

/**
 * Helper method for seeing if an interaction was triggered in a Guild App or User App context
 * @param {import('discord-api-types/v10').APIInteraction} interaction
 * 
 * @returns {'GUILD_CONTEXT'|'USER_CONTEXT'} Context this was triggered in
 */
export function getInteractionContext(interaction) {
    if ( interaction.context === InteractionContextType.Guild ) { return 'GUILD_CONTEXT'; }
    else { return 'USER_CONTEXT'; }
}

/**
 * Helper method for quickly checking an Interaction's `entitlements` field for the Inferno SKU
 * @param {import('discord-api-types/v10').APIInteraction} interaction 
 * 
 * @returns {Boolean} Boolean stating if this Interaction has (TRUE) the SKU or not (FALSE)
 */
export function checkForInfernoSku(interaction) {
  if ( interaction.entitlements.length > 0 ) {
      let infernoSku = interaction.entitlements.find(entitlement => entitlement.sku_id === SKU_INFERNO_ID);
      if ( infernoSku != undefined ) {
        // Edge-case, YOU NEVER KNOW
        if ( infernoSku.guild_id !== interaction.guild_id ) {
          return false;
        }
        else {
          return true;
        }
      }
      else {
        return false;
      }
  }
  else {
    return false;
  }
}

/**
 * Converts hex colour codes into RGB numbers, since DJS Builders doesn't actually support the hex values for some reason.
 * Sourced from Stack Overflow
 * @link https://stackoverflow.com/a/5624139
 * 
 * @param {String} hex
 */
export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
}

/**
 * Converts RGB Array into an API-compatible integer for Discord's API
 * @param {Array<Number>} rgbArray
 */
export function rgbArrayToInteger(rgbArray) {
  const [red, green, blue] = rgbArray;
  let colorInteger = (red << 16) + (green << 8) + blue;
  return colorInteger;
}

/**
 * Returns a random integer within the range specified (inclusive)
 * @param {Number} minimumValue
 * @param {Number} maximumValue
 * 
 * @returns {Number}
 */
export function randomNumberInRange(minimumValue, maximumValue) {
  return Math.floor(( Math.random() * maximumValue ) + minimumValue);
}

/**
 * Returns the public locale from the interaction. Tries to return `guild_locale` if possible, otherwise returns `locale`
 * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction 
 * 
 * @returns {import('discord-api-types/v10').Locale}
 */
export function getInteractionLocale(interaction) {
  return interaction.guild_locale != undefined ? interaction.guild_locale : interaction.locale;
}

/**
 * Checks for specific Server Permissions in a specific Server Channel.
 * This method only exists because Discord does NOT make it easy to check this as a HTTP-only App.
 * 
 * @param {String} permission Stringified Big Int of a single Permission to check for
 * @param {String} serverId Server ID of the Server the Channel is in
 * @param {String} channelId Channel ID of the Channel to check in
 * 
 * @returns {Promise<Boolean>|Promise<'NoAccess'>} Boolean representing if TwiLite has this Permission in the Channel or not. If TwiLite does not have VIEW_CHANNEL Permission, 'NoAccess' will be returned instead.
 */
export async function checkForPermissionInChannel(permission, serverId, channelId) {
  let convertedPerm = BigInt(permission);


  /*
   * If there are any errors with the order of checks here, please feel free to let me know (or open a PR on TwiLite's GitHub)!
   * 
   * This whole method was written out of spite and annoyance because, really, I shouldn't need to have to write an overly complex method just to check these permissions!
   */


  // Grab Channel, and TwiLite's Roles, to be able to check permissions
  let guildChannelRaw = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
    method: 'GET',
    headers: DefaultDiscordRequestHeaders
  });
  /** @type {import('discord-api-types/v10').APIChannel} */
  let guildChannel = await guildChannelRaw.json();

  // if missing VIEW_CHANNEL permission, TwiLite will not have access to the channel in question. As such, reject early!
  if ( guildChannelRaw.status === 403 ) { return 'NoAccess'; }


  let twiliteMemberRaw = await fetch(`https://discord.com/api/v10/guilds/${serverId}/members/${DISCORD_APP_USER_ID}`, {
    method: 'GET',
    headers: DefaultDiscordRequestHeaders
  });
  /** @type {import('discord-api-types/v10').APIGuildMember} */
  let twiliteMember = await twiliteMemberRaw.json();

  // Also fetch all Roles so we don't have to loop through unneeded API calls :)
  //   (Even though this whole method would be a LOT smaller if Discord just provided calculated permission bitfields for Apps in all cases :c)
  let guildRolesRaw = await fetch(`https://discord.com/api/v10/guilds/${serverId}/roles`, {
    method: 'GET',
    headers: DefaultDiscordRequestHeaders
  });
  /** @type {import('discord-api-types/v10').APIRole[]} */
  let guildRoles = await guildRolesRaw.json();

  let hasEveryoneGlobalPermission = false;
  let hasRoleGlobalPermission = false;
  let hasEveryoneChannelOverrideGrant = false;
  let hasEveryoneChannelOverrideRevoke = false;
  let hasRoleChannelOverrideGrant = false;
  let hasRoleChannelOverrideRevoke = false;
  let hasUserChannelOverrideGrant = false;
  let hasUserChannelOverrideRevoke = false;


  // Check against atEveryone's global server permissions
  let atEveryoneRole = guildRoles.find(role => role.id === serverId);
  if ( (BigInt(atEveryoneRole.permissions) & convertedPerm) == convertedPerm ) {
    hasEveryoneGlobalPermission = true;
  }

  // Also check atEveryone's channel overrides
  if ( guildChannel.permission_overwrites != undefined ) {
    let everyoneOverride = guildChannel.permission_overwrites.find(override => override.id === serverId);
    if ( everyoneOverride != undefined ) {
      if ( (BigInt(everyoneOverride.allow) & convertedPerm) == convertedPerm ) {
        hasEveryoneChannelOverrideGrant = true;
      }

      if ( (BigInt(everyoneOverride.deny) & convertedPerm) == convertedPerm ) {
        hasEveryoneChannelOverrideRevoke = true;
      }
    }
  }


  // If TwiLite does NOT have any Roles, skip doing the role based checks since we only need to check based on atEveryone & user
  if ( twiliteMember.roles.length > 0 ) {
    // Check global role permissions AND role-based channel overrides
    //   Having to use a FOR loop because the `break;` keyword doesn't work in `.forEach()` loops :c
    for ( let i = 0; i <= twiliteMember.roles.length - 1; i++ ) {
      let tempRoleId = twiliteMember.roles[i];
      let tempRoleObject = guildRoles.find(role => role.id === tempRoleId);

      if ( (BigInt(tempRoleObject.permissions) & convertedPerm) == convertedPerm ) {
        hasRoleGlobalPermission = true;
      }

      if ( guildChannel.permission_overwrites != undefined ) {
        let tempOverride = guildChannel.permission_overwrites.find(override => override.id === tempRoleId);
        if ( tempOverride != undefined ) {
          if ( (BigInt(tempOverride.allow) & convertedPerm) == convertedPerm ) {
            hasRoleChannelOverrideGrant = true;
          }

          if ( (BigInt(tempOverride.deny) & convertedPerm) == convertedPerm ) {
            hasRoleChannelOverrideRevoke = true;
          }
        }
      }

      if ( (hasRoleChannelOverrideGrant || hasRoleChannelOverrideRevoke) && hasRoleGlobalPermission ) { break; }
    }
  }


  if ( guildChannel.permission_overwrites != undefined ) {
    // Check user-based channel overrides
    let twiliteOverride = guildChannel.permission_overwrites.find(override => override.id === DISCORD_APP_USER_ID);
    if ( twiliteOverride != undefined ) {
      if ( (BigInt(twiliteOverride.allow) & convertedPerm) == convertedPerm ) {
        hasUserChannelOverrideGrant = true;
      }

      if ( (BigInt(twiliteOverride.deny) & convertedPerm) == convertedPerm ) {
        hasUserChannelOverrideRevoke = true;
      }
    }
  }



  // Return result, after calculations
  let result = false;

  if ( hasEveryoneGlobalPermission ) { result = true; }
  if ( hasRoleGlobalPermission ) { result = true; }
  if ( hasEveryoneChannelOverrideGrant ) { result = true; }
  if ( hasEveryoneChannelOverrideRevoke ) { result = false; }
  if ( hasRoleChannelOverrideGrant ) { result = true; }
  if ( hasRoleChannelOverrideRevoke ) { result = false; }
  if ( hasUserChannelOverrideGrant ) { result = true; }
  if ( hasUserChannelOverrideRevoke ) { result = false; }

  return result;
}

/**
 * Gets a valid Access Token for use in Twitch's API
 * 
 * @param {*} cfEnv 
 * 
 * @returns {Promise<String>}
 */
export async function getTwitchAccessToken(cfEnv) {
  // First check stored Token to see if it is still valid
  let storedToken = await cfEnv.crimsonkv.get(`twitchToken`);

  // Safety net for if there is no stored token
  if ( storedToken != undefined ) {
    //console.log("Twitch token found in store. Validate it");
    let validateTokenRequest = await fetch(`https://id.twitch.tv/oauth2/validate`, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${storedToken}`
      }
    });

    if ( validateTokenRequest.status === 200 ) {
      //console.log("Existing Twitch Token validated.");
      return storedToken;
    }
  }


  // Token not valid, get a new one
  let newTokenRequest = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });

  //console.log(`TWITCH TOKEN REQUEST: ${newTokenRequest.status} ${newTokenRequest.statusText}`);

  let resolvedTokenBody = await newTokenRequest.json();
  //console.log(`TOKEN EXPIRES IN: ${resolvedTokenBody.expires_in}`);

  // Store new token && return to calling method
  await cfEnv.crimsonkv.put(`twitchToken`, resolvedTokenBody.access_token);
  return resolvedTokenBody.access_token;
}

// Json Response Class
export class JsonResponse extends Response {
    constructor(body, init) {
        const jsonBody = JSON.stringify(body);
        init = init || {
            headers: {
                'content-type': 'application/json',
                Authorization: `Bot ${DISCORD_TOKEN}`,
            },
        };
        super(jsonBody, init);
    }
}




// ****************************************
// ANYTHING BELOW THIS LINE IS BORROWED FROM DISCORD.JS
// PURELY BECAUSE I'M NOT SMART ENOUGH TO FIGURE OUT HOW TO DO THIS MYSELF YET :sweat_smile:
// Borrowed from https://github.com/discordjs/discord.js/blob/main/packages/discord.js/src/util/DataResolver.js
// If you're one of the core maintainers of DJS and this isn't ok for me to do, feel free to (civilly & calmly) let me know!


/**
 * Data that can be resolved to give a Buffer. This can be:
 * * A Buffer
 * * The path to a local file
 * * A URL <warn>When provided a URL, discord.js will fetch the URL internally in order to create a Buffer.
 * This can pose a security risk when the URL has not been sanitized</warn>
 * @typedef {string|Buffer} BufferResolvable
 */

/**
 * @external Stream
 * @see {@link https://nodejs.org/api/stream.html}
 */

/**
 * @typedef {Object} ResolvedFile
 * @property {Buffer} data Buffer containing the file data
 * @property {string} [contentType] Content-Type of the file
 * @private
 */

/**
 * Resolves a BufferResolvable to a Buffer.
 * @param {BufferResolvable|Stream} resource The buffer or stream resolvable to resolve
 * @returns {Promise<ResolvedFile>}
 * @private
 */
async function resolveFile(resource) {
  if (Buffer.isBuffer(resource)) return { data: resource };

  if (typeof resource[Symbol.asyncIterator] === 'function') {
    const buffers = [];
    for await (const data of resource) buffers.push(Buffer.from(data));
    return { data: Buffer.concat(buffers) };
  }

  if (typeof resource === 'string') {
    if (/^https?:\/\//.test(resource)) {
      const res = await fetch(resource);
      return { data: Buffer.from(await res.arrayBuffer()), contentType: res.headers.get('content-type') };
    }

    const file = path.resolve(resource);

    const stats = await fs.stat(file);
    if (!stats.isFile()) throw new Error(`File Not Found`, file);
    return { data: await fs.readFile(file) };
  }

  throw new Error(`ReqResourceType`);
}

/**
 * Data that resolves to give a Base64 string, typically for image uploading. This can be:
 * * A Buffer
 * * A base64 string
 * @typedef {Buffer|string} Base64Resolvable
 */

/**
 * Resolves a Base64Resolvable to a Base 64 string.
 * @param {Base64Resolvable} data The base 64 resolvable you want to resolve
 * @param {string} [contentType='image/jpg'] The content type of the data
 * @returns {string}
 * @private
 */
function resolveBase64(data, contentType = 'image/jpg') {
  if (Buffer.isBuffer(data)) return `data:${contentType};base64,${data.toString('base64')}`;
  return data;
}

/**
 * Resolves a Base64Resolvable, a string, or a BufferResolvable to a Base 64 image.
 * @param {BufferResolvable|Base64Resolvable} image The image to be resolved
 * @returns {Promise<?string>}
 * @private
 */
export async function resolveImage(image) {
  if (!image) return null;
  if (typeof image === 'string' && image.startsWith('data:')) {
    return image;
  }
  const file = await resolveFile(image);
  return resolveBase64(file.data);
}
