import { ComponentType, InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { JsonResponse, resolveImage } from '../../../Utility/utilityMethods.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { DefaultDiscordRequestHeaders } from '../../../Utility/utilityConstants.js';


const AcceptedFileTypes = [ "image/png", "image/jpeg", "image/gif" ];


export const Modal = {
    /** The Modals's name - set as the START of the Modal's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "modalName_extraData"
     * @type {String}
     */
    name: "branding",

    /** Modal's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles submitted Custom Branding updates for TwiLite",

    /** Runs the Modal
     * @param {import('discord-api-types/v10').APIModalSubmitGuildInteraction} interaction 
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeModal(interaction, interactionUser) {
        // Grab inputs
        const ModalComponents = interaction.data.components;
        /** @type {?import('discord-api-types/v10').APIAttachment} */
        let inputAvatarFile = null;
        /** @type {?import('discord-api-types/v10').APIAttachment} */
        let inputBannerFile = null;
        /** @type {?String} */
        let inputBio = null;

        for (let i = 0; i <= ModalComponents.length - 1; i++) {
            // Safety Net
            if ( ModalComponents[i].type === ComponentType.Label ) {
                let tempTopLevelComp = ModalComponents[i].component;
                // Avatar
                if ( tempTopLevelComp.custom_id === "avatar" ) {
                    inputAvatarFile = interaction.data.resolved?.attachments[tempTopLevelComp.values.shift()];
                }
                // Banner
                else if ( tempTopLevelComp.custom_id === "banner" ) {
                    inputBannerFile = interaction.data.resolved?.attachments[tempTopLevelComp.values.shift()];
                }
                // Bio
                else if ( tempTopLevelComp.custom_id === "bio" ) {
                    inputBio = tempTopLevelComp.value;
                }
            }
        }


        // Validation checks
        /** Whether the inputted Avatar is valid or not. Should be NULL if no Avatar was inputted.
         * @type {?Boolean}
         */
        let isAvatarValid = null;
        /**
         * @type {null|'FILE_TYPE'|'FILE_SIZE'|'IMAGE_DIMENSION'}
         */
        let avatarInvalidReason = null;
        /** Whether the inputted Banner is valid or not. Should be NULL if no Banner was inputted.
         * @type {?Boolean}
         */
        let isBannerValid = null;
        /**
         * @type {null|'FILE_TYPE'|'FILE_SIZE'|'IMAGE_DIMENSION'}
         */
        let bannerInvalidReason = null;


        // AVATAR
        if ( inputAvatarFile != null ) {
            // File Type
            if ( !AcceptedFileTypes.includes(inputAvatarFile.content_type) ) {
                isAvatarValid = false;
                avatarInvalidReason = 'FILE_TYPE';
            }
            // File Size (10MB)
            else if ( inputAvatarFile.size >= 1e+7 ) {
                isAvatarValid = false;
                avatarInvalidReason = 'FILE_SIZE';
            }
            // Valid!
            else {
                isAvatarValid = true;
            }
        }

        // BANNER
        if ( inputBannerFile != null ) {
            // File Type
            if ( !AcceptedFileTypes.includes(inputBannerFile.content_type) ) {
                isBannerValid = false;
                bannerInvalidReason = 'FILE_TYPE';
            }
            // File Size (10MB)
            else if ( inputBannerFile.size >= 1e+7 ) {
                isBannerValid = false;
                bannerInvalidReason = 'FILE_SIZE';
            }
            // Image Dimension
            else if ( inputBannerFile.height < 240 || inputBannerFile.width < 620 ) {
                isBannerValid = false;
                bannerInvalidReason = 'IMAGE_DIMENSION';
            }
            // VALID!
            else {
                isBannerValid = true;
            }
        }


        // If either AVATAR or BANNER are invalid, reject with error to User
        if ( isAvatarValid === false || isBannerValid === false ) {
            let errorOutputMessage = "";

            // Only one is invalid
            if ( isAvatarValid === false && (isBannerValid === true || isBannerValid == null) ) {
                if ( avatarInvalidReason === 'FILE_SIZE' ) {
                    errorOutputMessage = localize(interaction.locale, 'BRANDING_COMMAND_MODAL_ERROR_FILE_SIZE_TOO_LARGE', localize(interaction.locale, 'BRANDING_COMMAND_MODAL_ERROR_FILE_AVATAR_PREFIX'));
                }
                else if ( avatarInvalidReason === 'FILE_TYPE' ) {
                    errorOutputMessage = localize(interaction.locale, 'BRANDING_COMMAND_MODAL_ERROR_FILE_INVALID_TYPE', localize(interaction.locale, 'BRANDING_COMMAND_MODAL_ERROR_FILE_AVATAR_PREFIX'));
                }
            }
            else if ( isBannerValid === false && (isAvatarValid === true || isAvatarValid == null) ) {
                if ( bannerInvalidReason === 'FILE_SIZE' ) {
                    errorOutputMessage = localize(interaction.locale, 'BRANDING_COMMAND_MODAL_ERROR_FILE_SIZE_TOO_LARGE', localize(interaction.locale, 'BRANDING_COMMAND_MODAL_ERROR_FILE_BANNER_PREFIX'));
                }
                else if ( bannerInvalidReason === 'FILE_TYPE' ) {
                    errorOutputMessage = localize(interaction.locale, 'BRANDING_COMMAND_MODAL_ERROR_FILE_INVALID_TYPE', localize(interaction.locale, 'BRANDING_COMMAND_MODAL_ERROR_FILE_BANNER_PREFIX'));
                }
                else if ( bannerInvalidReason === 'IMAGE_DIMENSION' ) {
                    errorOutputMessage = localize(interaction.locale, 'BRANDING_COMMAND_MODAL_ERROR_BANNER_DIMENSIONS_TOO_SMALL');
                }
            }
            // Both are invalid
            else if ( isAvatarValid === false && isBannerValid === false ) {
                // Different reasons
                if ( avatarInvalidReason !== bannerInvalidReason ) {
                    // Avatar
                    if ( avatarInvalidReason === 'FILE_SIZE' ) {
                        errorOutputMessage = localize(interaction.locale, 'BRANDING_COMMAND_MODAL_ERROR_FILE_SIZE_TOO_LARGE', localize(interaction.locale, 'BRANDING_COMMAND_MODAL_ERROR_FILE_AVATAR_PREFIX'));
                    }
                    else if ( avatarInvalidReason === 'FILE_TYPE' ) {
                        errorOutputMessage = localize(interaction.locale, 'BRANDING_COMMAND_MODAL_ERROR_FILE_INVALID_TYPE', localize(interaction.locale, 'BRANDING_COMMAND_MODAL_ERROR_FILE_AVATAR_PREFIX'));
                    }

                    // Banner
                    if ( bannerInvalidReason === 'FILE_SIZE' ) {
                        errorOutputMessage += `\n\n` + localize(interaction.locale, 'BRANDING_COMMAND_MODAL_ERROR_FILE_SIZE_TOO_LARGE', localize(interaction.locale, 'BRANDING_COMMAND_MODAL_ERROR_FILE_BANNER_PREFIX'));
                    }
                    else if ( bannerInvalidReason === 'FILE_TYPE' ) {
                        errorOutputMessage += `\n\n` + localize(interaction.locale, 'BRANDING_COMMAND_MODAL_ERROR_FILE_INVALID_TYPE', localize(interaction.locale, 'BRANDING_COMMAND_MODAL_ERROR_FILE_BANNER_PREFIX'));
                    }
                    else if ( bannerInvalidReason === 'IMAGE_DIMENSION' ) {
                        errorOutputMessage += `\n\n` + localize(interaction.locale, 'BRANDING_COMMAND_MODAL_ERROR_BANNER_DIMENSIONS_TOO_SMALL');
                    }
                }
                // Matching reasons
                else if ( avatarInvalidReason === bannerInvalidReason ) {
                    if ( avatarInvalidReason === 'FILE_SIZE' ) {
                        errorOutputMessage = localize(interaction.locale, 'BRANDING_COMMAND_MODAL_ERROR_FILE_SIZE_TOO_LARGE', localize(interaction.locale, 'BRANDING_COMMAND_MODAL_ERROR_FILE_AVATAR_AND_BANNER_PREFIX'));
                    }
                    else if ( avatarInvalidReason === 'FILE_TYPE' ) {
                        errorOutputMessage = localize(interaction.locale, 'BRANDING_COMMAND_MODAL_ERROR_FILE_INVALID_TYPE', localize(interaction.locale, 'BRANDING_COMMAND_MODAL_ERROR_FILE_AVATAR_AND_BANNER_PREFIX'));
                    }
                }
            }

            // Output error
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    flags: MessageFlags.Ephemeral,
                    content: errorOutputMessage
                }
            });
        }



        // Attempt applying update to TwiLite's Member Profile
        let requestBody = {};
        if ( inputAvatarFile != null && isAvatarValid === true ) { requestBody.avatar = await resolveImage(inputAvatarFile.url); }
        if ( inputBannerFile != null && isBannerValid === true ) { requestBody.banner = await resolveImage(inputBannerFile.url); }
        if ( inputBio != null && inputBio != "" ) { requestBody.bio = inputBio; }

        let requestUpdateCurrentMember = await fetch(`https://discord.com/api/v10/guilds/${interaction.guild_id}/members/@me`, {
            method: 'PATCH',
            headers: DefaultDiscordRequestHeaders,
            body: JSON.stringify(requestBody)
        });

        if ( requestUpdateCurrentMember.status === 200 ) {
            return new JsonResponse({
                type: InteractionResponseType.UpdateMessage,
                data: {
                    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
                    /** @type {import('discord-api-types/v10').APIMessageTopLevelComponent[]} */
                    components: [{
                        "type": ComponentType.TextDisplay,
                        "content": localize(interaction.locale, 'BRANDING_COMMAND_PROFILE_EDIT_SUCCESS')
                    }]
                }
            });
        }
        else {
            let resolveReturnedData = await requestUpdateCurrentMember.json();

            return new JsonResponse({
                type: InteractionResponseType.UpdateMessage,
                data: {
                    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
                    /** @type {import('discord-api-types/v10').APIMessageTopLevelComponent[]} */
                    components: [{
                        "type": ComponentType.TextDisplay,
                        "content": localize(interaction.locale, 'BRANDING_COMMAND_ERROR_PROFILE_EDIT_FAILED', `${JSON.stringify(resolveReturnedData)}`)
                    }]
                }
            });
        }
    }
}
