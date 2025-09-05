module.exports = {

    // ******* GENERIC STUFF
    DELETE: `Delete`,
    CANCEL: `Cancel`,
    JUMP_TO_SOURCE_MESSAGE: `Jump to source Message`,

    ERROR_GENERIC: `An error has occurred.`,
    ERROR_GENERIC_WITH_PREVIEW: `An error has occurred. A preview of the raw error is as follows:\n\`\`\`{{0}}\`\`\``,
    ERROR_INVALID_COLOR_HEX: `That wasn't a valid hex color code! Please try again, using a valid hex color code, including the \`#\` (hash) at the start. For example: \`#62af4d\``,



    // ******* GENERIC SLASH COMMAND STUFF
    SLASH_COMMAND_ERROR_GENERIC: `Sorry, but there was a problem trying to run this Slash Command...`,

    SLASH_COMMAND_ERROR_COOLDOWN_SECONDS: `Please wait {{0}} more seconds before using this Slash Command again.`,
    SLASH_COMMAND_ERROR_COOLDOWN_MINUTES: `Please wait {{0}} more minutes before using this Slash Command again.`,
    SLASH_COMMAND_ERROR_COOLDOWN_HOURS: `Please wait {{0}} more hours before using this Slash Command again.`,
    SLASH_COMMAND_ERROR_COOLDOWN_DAYS: `Please wait {{0}} more days before using this Slash Command again.`,
    SLASH_COMMAND_ERROR_COOLDOWN_MONTHS: `Please wait {{0}} more months before using this Slash Command again.`,



    // ******* GENERIC CONTEXT COMMAND STUFF
    CONTEXT_COMMAND_ERROR_GENERIC: `Sorry, an error occurred while trying to run this Context Command...`,
    CONTEXT_COMMAND_ERROR_SYSTEM_AND_BOT_MESSAGES_UNSUPPORTED: `Sorry, but this Context Command cannot be used on a System or Bot Message.`,
    CONTEXT_COMMAND_ERROR_MISSING_CONTENT: `Sorry, but that Message doesn't have any content! (Attachments aren't checked by this Context Command).`,

    CONTEXT_COMMAND_ERROR_COOLDOWN_SECONDS: `Please wait {{0}} more seconds before using this Context Command again.`,
    CONTEXT_COMMAND_ERROR_COOLDOWN_MINUTES: `Please wait {{0}} more minutes before using this Context Command again.`,
    CONTEXT_COMMAND_ERROR_COOLDOWN_HOURS: `Please wait {{0}} more hours before using this Context Command again.`,
    CONTEXT_COMMAND_ERROR_COOLDOWN_DAYS: `Please wait {{0}} more days before using this Context Command again.`,
    CONTEXT_COMMAND_ERROR_COOLDOWN_MONTHS: `Please wait {{0}} more months before using this Context Command again.`,



    // ******* GENERIC BUTTON STUFF
    BUTTON_ERROR_GENERIC: `An error occurred while trying to process that Button press...`,

    BUTTON_ERROR_COOLDOWN_SECONDS: `Please wait {{0}} more seconds before using this Button again.`,
    BUTTON_ERROR_COOLDOWN_MINUTES: `Please wait {{0}} more minutes before using this Button again.`,
    BUTTON_ERROR_COOLDOWN_HOURS: `Please wait {{0}} more hours before using this Button again.`,
    BUTTON_ERROR_COOLDOWN_DAYS: `Please wait {{0}} more days before using this Button again.`,
    BUTTON_ERROR_COOLDOWN_MONTHS: `Please wait {{0}} more months before using this Button again.`,



    // ******* GENERIC SELECT MENU STUFF
    SELECT_ERROR_GENERIC: `An error occurred while trying to process that Select Menu choice...`,

    SELECT_ERROR_COOLDOWN_SECONDS: `Please wait {{0}} more seconds before using this Select Menu again.`,
    SELECT_ERROR_COOLDOWN_MINUTES: `Please wait {{0}} more minutes before using this Select Menu again.`,
    SELECT_ERROR_COOLDOWN_HOURS: `Please wait {{0}} more hours before using this Select Menu again.`,
    SELECT_ERROR_COOLDOWN_DAYS: `Please wait {{0}} more days before using this Select Menu again.`,
    SELECT_ERROR_COOLDOWN_MONTHS: `Please wait {{0}} more months before using this Select Menu again.`,



    // ******* GENERIC MODAL STUFF
    MODAL_ERROR_GENERIC: `An error occurred while trying to process that Modal submission...`,



    // ******* GENERIC AUTOCOMPLETE STUFF
    AUTOCOMPLETE_ERROR_GENERIC: `Error: Unable to process.`,



    // ******* ACTION COMMAND RESPONSES
    ACTION_COMMAND_OTHER_USER_HEADPAT: `**{{0}}** gave **{{1}}** a headpat`,
    ACTION_COMMAND_OTHER_USER_HUG: `**{{0}}** cuddled **{{1}}**`,
    ACTION_COMMAND_OTHER_USER_BONK: `**{{0}}** bonked **{{1}}**`,
    ACTION_COMMAND_OTHER_USER_BOOP: `**{{0}}** booped **{{1}}**`,
    ACTION_COMMAND_OTHER_USER_KISS: `**{{0}}** kissed **{{1}}**`,
    ACTION_COMMAND_OTHER_USER_YEET: `**{{0}}** yeeted **{{1}}**`,
    ACTION_COMMAND_OTHER_USER_COOKIE: `**{{0}}** gave a cookie to **{{1}}**`,
    ACTION_COMMAND_OTHER_USER_SLAP: `**{{0}}** slapped **{{1}}**`,
    ACTION_COMMAND_OTHER_USER_JAIL: `**{{0}}** was sent to jail by **{{1}}**`,

    ACTION_COMMAND_SELF_USER_HEADPAT: `**{{0}}** gave themself a headpat`,
    ACTION_COMMAND_SELF_USER_HUG: `**{{0}}** gave themself a cuddle`,
    ACTION_COMMAND_SELF_USER_BONK: `**{{0}}** bonked themself`,
    ACTION_COMMAND_SELF_USER_BOOP: `**{{0}}** booped themself`,
    ACTION_COMMAND_SELF_USER_KISS: `**{{0}}** attempted to kiss themself`,
    ACTION_COMMAND_SELF_USER_YEET: `**{{0}}** yeeted themselves out of a cannon`,
    ACTION_COMMAND_SELF_USER_COOKIE: `**{{0}}** snuck a cookie out of the cookie jar for themselves`,
    ACTION_COMMAND_SELF_USER_SLAP: `**{{0}}** slapped themselves`,

    ACTION_COMMAND_ROLE_HEADPAT: `**{{0}}** gave everyone with **{{1}}** headpats`,
    ACTION_COMMAND_ROLE_HUG: `**{{0}}** gave everyone with **{{1}}** a group hug`,
    ACTION_COMMAND_ROLE_BONK: `**{{0}}** collectively bonked **{{1}}**`,
    ACTION_COMMAND_ROLE_BOOP: `**{{0}}** booped everyone with **{{1}}**`,
    ACTION_COMMAND_ROLE_KISS: `**{{0}}** kissed everyone with **{{1}}**`,
    ACTION_COMMAND_ROLE_YEET: `**{{0}}** collectively yeeted **{{1}}**`,
    ACTION_COMMAND_ROLE_COOKIE: `**{{0}}** gave **{{1}}** a cookie`,
    ACTION_COMMAND_ROLE_SLAP: `**{{0}}** collectively slapped **{{1}}**`,

    ACTION_COMMAND_EVERYONE_HEADPAT: `**{{0}}** gave \`@everyone\` a headpat`,
    ACTION_COMMAND_EVERYONE_HUG: `**{{0}}** gave \`@everyone\` a group hug`,
    ACTION_COMMAND_EVERYONE_BONK: `**{{0}}** bonked \`@everyone\``,
    ACTION_COMMAND_EVERYONE_BOOP: `**{{0}}** booped \`@everyone\``,
    ACTION_COMMAND_EVERYONE_KISS: `**{{0}}** gave \`@everyone\` a kiss`,
    ACTION_COMMAND_EVERYONE_YEET: `**{{0}}** yeeted \`@everyone\` with a catapult`,
    ACTION_COMMAND_EVERYONE_COOKIE: `**{{0}}** gave \`@everyone\` a cookie`,
    ACTION_COMMAND_EVERYONE_SLAP: `**{{0}}** slapped \`@everyone\``,

    ACTION_COMMAND_OTHER_APPS_HEADPAT: `**{{0}}** gave **{{1}}** a virtual headpat`,
    ACTION_COMMAND_OTHER_APPS_HUG: `**{{0}}** virtually cuddled **{{1}}**`,
    ACTION_COMMAND_OTHER_APPS_BONK: `**{{0}}** bonked **{{1}}**'s code`,
    ACTION_COMMAND_OTHER_APPS_BOOP: `**{{0}}** booped **{{1}}**`,
    ACTION_COMMAND_OTHER_APPS_KISS: `**{{0}}** sent **{{1}}** a virtual kiss`,
    ACTION_COMMAND_OTHER_APPS_YEET: `**{{0}}** yeeted **{{1}}** out the internet`,
    ACTION_COMMAND_OTHER_APPS_COOKIE: `**{{0}}** gave **{{1}}** a virtual cookie`,
    ACTION_COMMAND_OTHER_APPS_SLAP: `**{{0}}** slapped **{{1}}**'s physical servers`,

    ACTION_COMMAND_TWILITE_HEADPAT: `**{{0}}** gave me a headpat <3`,
    ACTION_COMMAND_TWILITE_HUG: `**{{0}}** cuddled me <3`,
    ACTION_COMMAND_TWILITE_BONK: `I bonked **{{0}}** in retaliation - nobody attempts to bonk me!`,
    ACTION_COMMAND_TWILITE_BOOP: `**{{0}}** booped me!`,
    ACTION_COMMAND_TWILITE_KISS: `**{{0}}** kissed...me? :flushed:`,
    ACTION_COMMAND_TWILITE_YEET: `I gave **{{0}}** flying lessons for trying to yeet me!`,
    ACTION_COMMAND_TWILITE_COOKIE: `**{{0}}** gave me a virtual cookie!`,
    ACTION_COMMAND_TWILITE_SLAP: `**{{0}}** slapped me?! How dare you!`,

    ACTION_COMMAND_MEE6_HEADPAT: `***{{0}}** gave **{{1}}** a headpat...*`,
    ACTION_COMMAND_MEE6_HUG: `***{{0}}** hugged **{{1}}**...*`,
    ACTION_COMMAND_MEE6_BONK: `**{{0}}** bonked **{{1}}**!`,
    ACTION_COMMAND_MEE6_BOOP: `***{{0}}** booped **{{1}}**...*`,
    ACTION_COMMAND_MEE6_KISS: `OK, listen **{{0}}**, **{{1}}** doesn't deserve a kiss.`,
    ACTION_COMMAND_MEE6_YEET: `**{{0}}** absolutely YEETED **{{1}}**`,
    ACTION_COMMAND_MEE6_COOKIE: `**{{0}}** gave **{{1}}** a cookie from the Dark Side`,
    ACTION_COMMAND_MEE6_SLAP: `**{{0}}** gave **{{1}}** a royal slapping`,

    ACTION_RETURN_BUTTON_LABEL_HEADPAT: `Return Headpat`,
    ACTION_RETURN_BUTTON_LABEL_HUG: `Return Hug`,
    ACTION_RETURN_BUTTON_LABEL_BONK: `Return Bonk`,
    ACTION_RETURN_BUTTON_LABEL_BOOP: `Return Boop`,
    ACTION_RETURN_BUTTON_LABEL_KISS: `Return Kiss`,
    ACTION_RETURN_BUTTON_LABEL_SLAP: `Return Slap`,

    ACTION_RETURN_HEADPAT: `**{{0}}** gave **{{1}}** a headpat in return!`,
    ACTION_RETURN_HUG: `**{{0}}** cuddled **{{1}}** too!`,
    ACTION_RETURN_BONK: `**{{0}}** bonked **{{1}}** in retaliation!`,
    ACTION_RETURN_BOOP: `**{{0}}** revenge booped **{{1}}**!`,
    ACTION_RETURN_KISS: `**{{0}}** kissed **{{1}}** in return!`,
    ACTION_RETURN_SLAP: `**{{0}}** slapped **{{1}}** in retaliation!`,

    ACTION_ERROR_RETURN_NOT_TARGETED_AT_SELF: `You cannot return an Action that wasn't aimed at you!`,
    ACTION_ERROR_CANNOT_RETURN_TO_SENDER: `You cannot return the Action you sent!`,
    ACTION_ERROR_RETURN_CANNOT_FETCH_ORIGINAL_SENDER: `Sorry, there was an error trying to fetch the original sender of that Action.`,
    ACTION_ERROR_RETURN_CANNOT_FETCH_TARGET: `Sorry, but there was an error trying to fetch the original target of that Action.`,
    
    // JAIL ACTION COMMAND
    ACTION_JAIL_MINIGAME_BAIL_BUTTON_LABEL: `Bail Freedom`,
    ACTION_JAIL_MINIGAME_BREAKOUT_BUTTON_LABEL: `Attempt Jailbreak`,

    ACTION_JAIL_MINIGAME_BAIL_SENDER_SUCCESSFUL: `-# **{{0}}** felt bad for sending **{{1}}** to jail and paid their bail to free them!`,
    ACTION_JAIL_MINIGAME_BAIL_SENDER_FAILURE: `-# **{{0}}** felt bad for sending **{{1}}** to jail, but couldn't afford their bail to free them!`,
    ACTION_JAIL_MINIGAME_BAIL_OTHER_SUCCESSFUL: `-# **{{0}}** paid **{{1}}**'s bail to free them!`,
    ACTION_JAIL_MINIGAME_BAIL_OTHER_FAILURE: `-# **{{0}}** wanted to pay **{{1}}**'s bail to free them, but couldn't afford it!`,

    ACTION_JAIL_MINIGAME_BREAKOUT_TARGET_SUCCESSFUL: `-# **{{0}}** successfully broke themselves out of jail!`,
    ACTION_JAIL_MINIGAME_BREAKOUT_TARGET_FAILURE: `-# **{{0}}** failed to break themselves out of jail, and extended their jail sentence!`,
    ACTION_JAIL_MINIGAME_BREAKOUT_SENDER_SUCCESSFUL: `-# **{{0}}** felt bad for sending **{{1}}** to jail, and broke them out of jail!`,
    ACTION_JAIL_MINIGAME_BREAKOUT_SENDER_FAILURE: `-# **{{0}}** felt bad for sending **{{1}}** to jail, and decided to join them in jail!`,
    ACTION_JAIL_MINIGAME_BREAKOUT_OTHER_SUCCESSFUL: `-# **{{0}}** successfully broke **{{1}}** out of jail!`,
    ACTION_JAIL_MINIGAME_BREAKOUT_OTHER_FAILURE: `-# **{{0}}** failed to break **{{1}}** out of jail, and ended up sending themselves to jail instead!`,

    ACTION_ERROR_CANNOT_JAIL_SELF: `You cannot send yourself to jail!`,
    ACTION_ERROR_JAIL_MISSING_ATTACH_FILES_PERMISSION_ON_GUILD: `Whoops, this command cannot be used as I am missing the "**Attach Files**" Permission here!`,
    ACTION_ERROR_JAIL_MISSING_ATTACH_FILES_PERMISSION_ON_USER: `Whoops, this command cannot be used as *you* are missing the "**Attach Files**" Permission here!`,
    ACTION_ERROR_JAIL_MINIGAME_CANNOT_BAIL_SELF: `You cannot pay your own bail to free yourself!`,



    // ******* ROLE MENUS
    // Role Menu: Slash Command initial responses
    ROLE_MENU_CREATE_INTRUCTIONS: `## __Role Menu Creation__
Use the Select Menu below to configure this Menu's Type, Embed and Role Buttons. Press an existing Role Button to edit its label and/or emoji.
-# If including in Buttons, please make sure to have the relevant Emoji IDs ready (such as in a notepad program); as you won't be able to copy from a Discord Message while an Input Form Modal is open.
-# Additionally, both Custom Discord Emojis, and standard Unicode Emojis, are supported.

**An auto-updating preview of what your new Role Menu will look like is shown below.**`,

    ROLE_MENU_TITLE_PLACEHOLDER: `## Self-assignable Role Menu`,
    ROLE_MENU_DESCRIPTION_PLACEHOLDER: `This Role Menu hasn't been configured yet!\nUse the select menu below to setup this Role Menu.`,
    ROLE_MENU_ROLE_LIST_PLACEHOLDER: `- No Roles added yet`,
    ROLE_MENU_REQUIREMENTS_PLACEHOLDER: `-# Anyone can use this Role Menu!`,
    ROLE_MENU_MENU_TYPE_PLACEHOLDER: `-# Menu Type: Toggle`,

    ROLE_MENU_EDIT_GUIDE: `To edit an existing Role Menu made with TwiLite, simply right-click/long-press on the Message containing the Role Menu -> Select "Apps" -> Select " [Edit Role Menu]({{0}}) ".`,

    ROLE_MENU_DELETE_GUIDE: `To delete an existing Role Menu made with TwiLite, you can either:
- Right-click/long-press on the Message containing the Role Menu -> Select "Apps" -> Select " [Delete Role Menu]({{0}}) "
- OR simply delete the Message containing the Role Menu`,

    ROLE_MENU_ERROR_INVALID_CHANNEL: `Sorry, you can only create self-assignable Role Menus inside of standard Text Channels.`,
    ROLE_MENU_ERROR_MISSING_MANAGE_ROLES_PERMISSION: `I do not seem to have the **Manage Roles** Permission!\nPlease ensure I have been granted it in order for my Role Menu Module to work, *and* that my highest Role is positioned above all the Roles you want to add to my Role Menus. (I cannot grant or revoke Roles above my highest Role)`,
    ROLE_MENU_ERROR_MISSING_SEND_MESSAGES_PERMISSION: `Sorry, but I cannot create a Role Menu in this Channel without having the **Send Messages** Permission!`,

    // Role Menu: Select Menu options
    ROLE_MENU_SELECT_AN_ACTION: `Please select an action`,

    ROLE_MENU_SET_MENU_TYPE: `Set Menu Type`,
    ROLE_MENU_SET_MENU_TYPE_DESCRIPTION: `Change how this Menu will behave once saved`,
    ROLE_MENU_CONFIGURE_EMBED: `Configure Details`,
    ROLE_MENU_CONFIGURE_EMBED_DESCRIPTION: `Set the Title, Description, and Sidebar Color of this Menu`,

    ROLE_MENU_ADD_ROLE: `Add Role`,
    ROLE_MENU_ADD_ROLE_DESCRIPTION: `Add a Role to this Menu`,
    ROLE_MENU_REMOVE_ROLE: `Remove Role`,
    ROLE_MENU_REMOVE_ROLE_DESCRIPTION: `Remove a Role from this Menu`,
    ROLE_MENU_ADD_REQUIREMENT: `Add a Requirement`,
    ROLE_MENU_ADD_REQUIREMENT_DESCRIPTION: `Add a Required Role to use this Menu`,
    ROLE_MENU_REMOVE_REQUIREMENT: `Remove a Requirement`,
    ROLE_MENU_REMOVE_REQUIREMENT_DESCRIPTION: `Remove a set Required Role from this Menu`,

    ROLE_MENU_SAVE_AND_POST: `Save & Post`,
    ROLE_MENU_SAVE_AND_POST_DESCRIPTION: `Saves this Menu, and posts it in chat for Members to use`,
    ROLE_MENU_SAVE_AND_UPDATE: `Save & Update`,
    ROLE_MENU_SAVE_AND_UPDATE_DESCRIPTION: `Saves this Menu, and updates it in chat for Members to use`,

    ROLE_MENU_CANCEL_CREATION: `Cancel Creation`,
    ROLE_MENU_CANCEL_CREATION_DESCRIPTION: `Cancels creation of this Role Menu`,
    ROLE_MENU_CANCEL_CONFIGURATION: `Cancel Configuration`,
    ROLE_MENU_CANCEL_CONFIGURATION_DESCRIPTION: `Cancels configuration of this Role Menu`,

    // Role Menu: Creation/Configuration Modals

    ROLE_MENU_ADD_ROLE_MODAL_TITLE: `Add a Role to your Menu`,
    ROLE_MENU_ADD_ROLE_MODAL_ROLE_SELECT_LABEL: `Role to add`,
    ROLE_MENU_ADD_ROLE_MODAL_ROLE_SELECT_DESCRIPTION: `Select which Role on this Server you want to add to your Role Menu.`,
    ROLE_MENU_ADD_ROLE_MODAL_ROLE_SELECT_PLACEHOLDER: `Select a Role`,
    ROLE_MENU_ADD_ROLE_MODAL_BUTTON_LABEL_INPUT_LABEL: `Button's label`,
    ROLE_MENU_ADD_ROLE_MODAL_BUTTON_LABEL_INPUT_DESCRIPTION: `What should display on the Button for this Role in your Menu?`,
    ROLE_MENU_ADD_ROLE_MODAL_BUTTON_COLOR_LABEL: `Button's colour`,
    ROLE_MENU_ADD_ROLE_MODAL_BUTTON_COLOR_DESCRIPTION: `What colour should this Role's Button display as on your Menu?`,
    ROLE_MENU_ADD_ROLE_MODAL_BUTTON_COLOR_SELECT_PLACEHOLDER: `Pick a colour`,
    ROLE_MENU_ADD_ROLE_MODAL_BUTTON_COLOR_OPTION_BLURPLE: `Blurple`,
    ROLE_MENU_ADD_ROLE_MODAL_BUTTON_COLOR_OPTION_GREEN: `Green`,
    ROLE_MENU_ADD_ROLE_MODAL_BUTTON_COLOR_OPTION_GREY: `Grey`,
    ROLE_MENU_ADD_ROLE_MODAL_BUTTON_COLOR_OPTION_RED: `Red`,

    ROLE_MENU_REMOVE_ROLE_MODAL_TITLE: `Remove a Role from your Menu`,
    ROLE_MENU_REMOVE_ROLE_MODAL_LABEL: `Role to remove`,
    ROLE_MENU_REMOVE_ROLE_MODAL_DESCRIPTION: `Select a Role to be removed from your Menu`,
    ROLE_MENU_REMOVE_ROLE_MODAL_PLACEHOLDER: `Select a Role`,

    ROLE_MENU_SET_MENU_TYPE_MODAL_TITLE: `Set your Menu's type`,
    ROLE_MENU_SET_MENU_TYPE_MODAL_TYPES_EXPLAINATION: `Please use the Select Menu below to pick which type of Role Menu you want. The types are as follows:

- **Toggle** - Your standard Role Menu Type. Behaves like a classic Reaction Role Menu, but with Buttons instead.
- **Swappable** - Users can only have 1 Role per **Swappable** Menu. Attempting to select another Role on the same **Swappable** Menu would swap the two Roles instead. Useful for Colour Role Menus!
- **Single-use** - Users can only use a **Single-use** Menu once, and are unable to revoke or swap out the selected Role from themselves. Useful for Team Roles in Events.`,
    ROLE_MENU_SET_MENU_TYPE_MODAL_SELECT_LABEL: `Set Menu Type`,
    ROLE_MENU_SET_MENU_TYPE_MODAL_SELECT_PLACEHOLDER: `Pick a type`,
    ROLE_MENU_SET_MENU_TYPE_MODAL_SELECT_OPTION_TOGGLE: `Toggle`,
    ROLE_MENU_SET_MENU_TYPE_MODAL_SELECT_OPTION_SWAP: `Swappable`,
    ROLE_MENU_SET_MENU_TYPE_MODAL_SELECT_OPTION_SINGLE_USE: `Single-use`,

    ROLE_MENU_SET_MENU_DETAILS_MODAL_TITLE: `Set your Menu's details`,
    ROLE_MENU_SET_MENU_DETAILS_MODAL_MENU_TITLE_LABEL: `Menu's Title`,
    ROLE_MENU_SET_MENU_DETAILS_MODAL_MENU_TITLE_DESCRIPTION: `Set the title of your Role Menu`,
    ROLE_MENU_SET_MENU_DETAILS_MODAL_MENU_DESCRIPTION_LABEL: `Menu's Description`,
    ROLE_MENU_SET_MENU_DETAILS_MODAL_MENU_DESCRIPTION_LABEL_DESCRIPTION: `Set an optional description of your Role Menu`,
    ROLE_MENU_SET_MENU_DETAILS_MODAL_MENU_COLOR_LABEL: `Menu's Colour`,
    ROLE_MENU_SET_MENU_DETAILS_MODAL_MENU_COLOR_DESCRIPTION: `Set the optional sidebar colour for your Role Menu. MUST be in a hex code format (eg: #ab44ff)`,

    ROLE_MENU_ADD_REQUIREMENT_MODAL_TITLE: `Add a Menu Requirement`,
    ROLE_MENU_ADD_REQUIREMENT_MODAL_LABEL: `Requirement to add`,
    ROLE_MENU_ADD_REQUIREMENT_MODAL_DESCRIPTION: `Pick a Role to add as a Required Role to use your Menu.`,
    ROLE_MENU_ADD_REQUIREMENT_MODAL_PLACEHOLDER: `Select a Role`,

    ROLE_MENU_REMOVE_REQUIREMENT_MODAL_TITLE: `Remove a Menu Requirement`,
    ROLE_MENU_REMOVE_REQUIREMENT_MODAL_LABEL: `Requirement to remove`,
    ROLE_MENU_REMOVE_REQUIREMENT_MODAL_DESCRIPTION: `Pick a Role Requirement to remove from this Menu`,
    ROLE_MENU_REMOVE_REQUIREMENT_MODAL_PLACEHOLDER: `Select a Role`,

    ROLE_MENU_EDIT_BUTTON_MODAL_TITLE: `Edit Button`,
    ROLE_MENU_EDIT_BUTTON_MODAL_DESCRIPTION: `Currently editing the Role Button for the <@&{{0}}> Role on your Menu.`,

    // Role Menu: Creation & Configuration Select Menu Responses
    ROLE_MENU_CREATION_SUCCESS: `Successfully created and posted your new Role Menu!\n\nIf you need to, you can edit or delete your Role Menu by using my Message Context Commands`,
    ROLE_MENU_CREATION_SUCCESS_IMAGE_ALT_TEXT: `TwiLite's Role Menu Context Commands, seen in the Message Context Menu (when opened on a Message containing TwiLite's Role Menu) and after selecting "Apps" on that Context Menu.`,
    ROLE_MENU_CREATION_CANCELLED: `Creation of this Role Menu has been cancelled.\nYou may now dismiss or delete this Message.`,
    ROLE_MENU_CREATION_ERROR_GENERIC: `An error occurred while trying to save your new Role Menu...`,

    ROLE_MENU_ADD_ROLE_MAX_BUTTONS_LIMIT_REACHED: `Sorry, but you cannot add more than 15 Role Buttons to a single Menu.`,
    ROLE_MENU_ADD_REQUIREMENTS_LIMIT_REACHED: `Sorry, but you cannot add more than 5 Requirements to a single Menu.`,
    ROLE_MENU_REMOVE_ROLE_NO_ROLES_ADDED: `Sorry, you cannot remove Roles from a Menu that doesn't have any Roles on it!`,
    ROLE_MENU_REMOVE_REQUIREMENT_NONE_ADDED: `Sorry, you cannot remove Requirements from a Menu with no set Requirements!`,

    // Role Menu: Responses to pressing Role Buttons
    ROLE_BUTTON_AUDIT_LOG_ENTRY: `Role Menu in {{0}}`,
    ROLE_BUTTON_REVOKE_SUCCESS: `Successfully revoked the {{0}} Role from you.`,
    ROLE_BUTTON_GRANT_SUCCESS: `Successfully granted the {{0}} Role to you.`,
    ROLE_BUTTON_SWAP_SUCCESS: `Successfully swapped the {{0}} Role for the {{1}} Role for you.`,
    
    ROLE_BUTTON_ERROR_REQUIREMENTS_NOT_MET: `Sorry, you do not meet the Requirements to use this Role Menu.\nYou can see what this Menu's Requirements are above the Buttons inside the Role Menu itself.`,
    ROLE_BUTTON_ERROR_REVOKE_FAILED: `Sorry, something went wrong while trying to revoke the {{0}} Role from you...`,
    ROLE_BUTTON_ERROR_GRANT_FAILED: `Sorry, something went wrong while trying to grant the {{0}} Role to you...`,
    ROLE_BUTTON_ERROR_SWAP_FAILED: `Sorry, something went wrong while trying to swap between the {{0}} and {{1}} Roles for you...`,
    ROLE_BUTTON_ERROR_SINGLE_USE_ONLY: `Sorry! You cannot swap or revoke Roles from yourself using Single-use Role Menus.\nThese Single-use Role Menus are designed to only be usable once per User per Menu.\n\nThe Role you already have from this Menu is the {{0}} Role.`,

    // Role Menu: Strings for the actual Menu
    ROLE_MENU_TYPE_TOGGLE: `Toggle`,
    ROLE_MENU_TYPE_SWAP: `Swappable`,
    ROLE_MENU_TYPE_SINGLE_USE: `Single-use`,
    ROLE_MENU_TYPE_FOOTER: `-# Menu Type: {{0}}`,

    //ROLE_MENU_ROLE_ADD_SEARCH: `Search for a Role to add`,
    //ROLE_MENU_ROLE_REMOVE_SEARCH: `Search for a Role to remove`,
    //ROLE_MENU_REQUIREMENT_ADD_SEARCH: `Search for a required Role to add`,
    //ROLE_MENU_REQUIREMENT_REMOVE_SEARCH: `Search for a required Role to remove`,

    //ROLE_MENU_SELECT_MENU_TYPE: `Select a Menu Type`,
    //ROLE_MENU_MENU_TYPE_TOGGLE: `Toggle`,
    //ROLE_MENU_MENU_TYPE_SWAPPABLE: `Swappable`,
    //ROLE_MENU_MENU_TYPE_SINGLE: `Single-use`,

    //ROLE_MENU_CONFIGURE_MENU_EMBED: `Configure Menu Embed`,
    //ROLE_MENU_EMBED_TITLE: `Embed Title`,
    //ROLE_MENU_EMBED_DESCRIPTION: `Embed Description`,
    //ROLE_MENU_EMBED_COLOR: `Embed Colour (in hex format)`,

    //ROLE_MENU_SELECT_BUTTON_COLOR: `Select a Button colour`,
    //ROLE_MENU_BUTTON_BLURPLE: `Blurple`,
    //ROLE_MENU_BUTTON_GREEN: `Green`,
    //ROLE_MENU_BUTTON_GREY: `Grey`,
    //ROLE_MENU_BUTTON_RED: `Red`,

    //ROLE_MENU_SET_BUTTON_LABEL: `Set Button Label`,
    //ROLE_MENU_EDIT_BUTTON_LABEL: `Edit Button Label`,
    //ROLE_MENU_BUTTON_LABEL: `Button Label (Required if no Emoji)`,
    //ROLE_MENU_BUTTON_EMOJI: `Button Emoji (Required if no Label)`,

//    ROLE_MENU_CONFIGURATION_INTRUCTIONS: `## __Role Menu Configuration__
//Use the Select Menu below to configure this Menu's Type, Embed and Role Buttons. Press an existing Role Button to edit its label and/or emoji.
//-# If including in Buttons, please make sure to have the relevant Emoji IDs ready (such as in a notepad program); as you won't be able to copy from a Discord Message while an Input Form is open.
//-# Additionally, both Custom Discord Emojis, and standard Unicode Emojis, are supported.
//
//**An auto-updating preview of what your updated Role Menu will look like is shown below.**`,

//    ROLE_MENU_SET_MENU_TYPE_INSTRUCTIONS: `Please use the Select Menu below to pick which type of Role Menu you want.
//- **Toggle** - Your standard Role Menu Type. Behaves like a classic Reaction Role Menu, but with Buttons instead.
//- **Swappable** - Users can only have 1 Role per **Swappable** Menu. Attempting to select another Role on the same **Swappable** Menu would swap the two Roles instead. Useful for Colour Role Menus!
//- **Single-use** - Users can only use a **Single-use** Menu once, and are unable to revoke or swap out the selected Role from themselves. Useful for Team Roles in Events.`,

    //ROLE_MENU_ROLE_ADD_INSTRUCTIONS: `Please use the Role Select Menu below to pick which Role from this Server you would like to add to your Role Menu.\n\nEnsure the Role you select is *lower* than TwiLite's own highest Role. TwiLite is unable to grant/revoke Roles higher than its own highest Role.`,
    //ROLE_MENU_ROLE_REMOVE_INSTRUCTIONS: `Please use the Role Select Menu below to pick which Role you would like to remove from your Role Menu.`,
    //ROLE_MENU_BUTTON_SET_INSTRUCTIONS: `**Selected Role: {{0}}**\nNext, please use the Select Menu below to pick which [colour of Button]({{1}}) you want to use for this Role.`,
    //ROLE_MENU_REQUIREMENT_ADD_INSTRUCTIONS: `Please use the Role Select Menu below to pick which Role from this Server you would like to add as a requirement to use your Role Menu.`,
    //ROLE_MENU_REQUIREMENT_REMOVE_INSTRUCTIONS: `Please use the Role Select Menu below to pick which Role Requirement you would like to remove from your Role Menu.`,

    //ROLE_MENU_SET_TYPE_SUCCESS: `Successfully set the type of your Role Menu.\nYou may now dismiss this Message.`,
    //ROLE_MENU_ADD_ROLE_SUCCESS: `Successfully added that Role to your Role Menu.\nYou may now dismiss this Message.`,
    //ROLE_MENU_REMOVE_ROLE_SUCCESS: `Successfully removed that Role from your Role Menu.\nYou may now dismiss this Message.`,
    //ROLE_MENU_ADD_REQUIREMENT_SUCCESS: `Successfully added that Role Requirement to your Role Menu.\nYou may now dismiss this Message.`,
    //ROLE_MENU_REMOVE_REQUIREMENT_SUCCESS: `Successfully removed that Role Requirement from your Role Menu.\nYou may now dismiss this Message.`,
    //ROLE_MENU_EDIT_BUTTON_SUCCESS: `Successfully edited that Button for your Role Menu.\nYou may now dismiss this Message.`,

    //ROLE_MENU_RESTRICTION_SINGLE: `Only those with the {{0}} Role can use this Role Menu.`,
    //ROLE_MENU_RESTRICTION_MULTIPLE: `Only those with one of either {{0}} Roles can use this Role Menu.`,

    //ROLE_MENU_CREATION_CANCELLED: `Creation of this Role Menu has been cancelled. You may now dismiss or delete this Message.`,
    //ROLE_MENU_CREATION_SUCCESS: `Successfully created and posted your new Role Menu!\n\nIf you need to, you can edit or delete your Role Menu by using my [Message Context Commands]({{0}})`,
    //ROLE_MENU_CONFIGURATION_CANCELLED: `Configuration of this Role Menu has been cancelled. You may now dismiss or delete this Message.`,
    //ROLE_MENU_CONFIGURATION_SUCCESS: `Successfully saved your updated Role Menu!`,

    //DELETE_ROLE_MENU_COMMAND_VALIDATION: `Are you sure you want to delete this Role Menu?`,
    //DELETE_ROLE_MENU_COMMAND_SUCCESS: `Successfully deleted that Role Menu.`,
    //DELETE_ROLE_MENU_COMMAND_CANCELLED: `Cancelled deletion of that Role Menu.`,

    //ROLE_BUTTON_AUDIT_LOG_ENTRY: `Role Menu in {{0}}`,
    //ROLE_BUTTON_REVOKE_SUCCESS: `Successfully revoked the {{0}} Role from you.`,
    //ROLE_BUTTON_GRANT_SUCCESS: `Successfully granted the {{0}} Role to you.`,
    //ROLE_BUTTON_SWAP_SUCCESS: `Successfully swapped the {{0}} Role for the {{1}} Role for you.`,

    //ROLE_MENU_ERROR_CREATION_GENERIC: `An error occurred while trying to save your new Role Menu...`,
    //ROLE_MENU_ERROR_CONFIGURATION_GENERIC: `An error occurred while trying to save your updated Role Menu...`,
    //DELETE_ROLE_MENU_COMMAND_ERROR_GENERIC: `Sorry, there was an error trying to delete that Role Menu...`,
    //ROLE_MENU_ERROR_NO_CACHE_FOUND_CREATION: `Sorry, you'll have to restart your Role Menu creation due to a rare error.`,
    //ROLE_MENU_ERROR_NO_CACHE_FOUND_CONFIGURATION: `Sorry, you'll have to restart your Role Menu configuration due to a rare error.`,
    //ROLE_MENU_ERROR_MISSING_NEEDED_ELEMENTS: `Sorry, you cannot save this Role Menu while it is missing important details.\nImportant Menu details needed are:\n- A Title for the Embed\n- The Menu's Type (in the Embed's footer)\n- At least 1 Role Button\n\nPlease ensure the these are not missing from this Role Menu before attempting to save again.`,

    //ROLE_MENU_ERROR_ACTIVE_CREATION: `Sorry, but there seems to already be an active Role Menu creation happening on this Server right now; either by yourself or someone else.\nPlease either wait for the User to finish creating their Role Menu, or wait for the inactive creation timer to expire (which is about one hour from initial use of this Slash Command).`,

    //ROLE_MENU_ERROR_ACTIVE_CONFIGURATION: `Sorry, but there seems to already be an active Role Menu configuration happening on this Server right now; either by yourself or someone else.\nPlease either wait for the User to finish configuring their Role Menu, or wait for the inactive configuration timer to expire (which is about one hour from initial use of this Context Command).`,

    //ROLE_MENU_ERROR_BUTTON_LIMIT_EXCEEDED: `Sorry, but you cannot add more than 15 Role Buttons to a single Menu.`,
    //ROLE_MENU_ERROR_NO_ROLES_ON_MENU: `Sorry, you cannot remove Roles from a Menu that doesn't have any Roles on it!`,
    //ROLE_MENU_ERROR_ROLE_NOT_ON_MENU: `{{0}} is __not__ on this Menu!`,
    //ROLE_MENU_ERROR_ROLE_ALREADY_ON_MENU: `{{0}} has already been added to this Role Menu!`,
    //ROLE_MENU_ERROR_ROLE_IS_A_REQUIREMENT: `You cannot add {{0}} as an assignable Role as it has already been added as a Menu Requirement.`,
    //ROLE_MENU_ERROR_REQUIREMENT_ROLE_NOT_ON_MENU: `{{0}} is __not__ on this Menu as a Requirement!`,
    //ROLE_MENU_ERROR_REQUIREMENT_ROLE_ALREADY_ON_MENU: `{{0}} has already been added as a Requirement to this Role Menu!`,
    //ROLE_MENU_ERROR_REQUIREMENT_ROLE_IS_A_BUTTON: `You cannot add {{0}} as a Requirement to this Menu as it is already added as an assignable Role.`,
    //ROLE_MENU_ERROR_REQUIREMENT_MAX_REACHED: `Sorry, you cannot have more than 5 Requirements added to a single Menu.`,
    //ROLE_MENU_ERROR_NO_REQUIREMENTS_FOUND: `Sorry, you cannot remove Requirements from a Menu with no set Requirements!`,
    //ROLE_MENU_ERROR_ROLE_TOO_HIGH: `{{0}} is higher than this Bot's own highest Role ( {{1}} ). As such, this Bot won't be able to grant or revoke it for other Members.`,
    //ROLE_MENU_ERROR_CANNOT_HAVE_BLANK_BUTTON: `Sorry, but you cannot leave both the Label and the Emoji fields blank.\nPlease try again, ensuring you include at least one of either Label or Emoji (or both).`,
    //ROLE_MENU_ERROR_INVALID_EMOJI: `Sorry, but there was an error trying to validate your included Emoji.\nPlease try again, ensuring you use either an [Unicode Emoji]({{0}}), or a raw Discord Custom Emoji string (example: \`<:grass_block:601353406577246208>\`)`,
    
    //EDIT_ROLE_MENU_COMMAND_ERROR_MESSAGE_INVALID: `Sorry, but that Message doesn't seem to contain any of my Role Menus.`,
    //EDIT_ROLE_MENU_COMMAND_ERROR_MISSING_MANAGE_ROLE_PERMISSION: `I do not seem to have the **Manage Roles** Permission!\nPlease ensure I have been granted it in order for my Role Menu Module to work.`,
    //EDIT_ROLE_MENU_COMMAND_ERROR_MISSING_MESSAGE_HISTORY_PERMISSION: `Sorry, but I cannot edit an existing Role Menu in this Channel without having the **Read Message History** Permission!`,

    //ROLE_BUTTON_ERROR_REVOKE_FAILED: `Sorry, something went wrong while trying to revoke the {{0}} Role from you...`,
    //ROLE_BUTTON_ERROR_GRANT_FAILED: `Sorry, something went wrong while trying to grant the {{0}} Role to you...`,
    //ROLE_BUTTON_ERROR_SWAP_FAILED: `Sorry, something went wrong while trying to swap between the {{0}} and {{1}} Roles for you...`,
    //ROLE_BUTTON_ERROR_SINGLE_USE_ONLY: `Sorry! You cannot swap or revoke Roles from yourself using Single-use Role Menus.\nThese Single-use Role Menus are designed to only be usable once per User per Menu.\n\nThe Role you already have from this Menu is the {{0}} Role.`,
    //ROLE_BUTTON_ERROR_REQUIREMENTS_NOT_MET: `Sorry, you do not meet the Requirements to use this Role Menu.\nYou can see what this Menu's Requirements are above the Menu itself.`,



    // ******* TEMPERATURE COMMANDS
    TEMPERATURE_COMMAND_CONVERTED: `{{0}}{{1}} is about {{2}}{{3}} or {{4}}{{5}}`,
    TEMPERATURE_COMMAND_SUCCESS_SINGLAR: `Here is your converted temperature:`,
    TEMPERATURE_COMMAND_SUCCESS_MULTIPLE: `Here are your converted temperatures:`,

    TEMPERATURE_COMMAND_ERROR_INVALID_TEMPERATURE: `:warning: {{0}}{{1}} is a temperature that cannot exist! (It is below Absolute Zero!)`,
    TEMPERATURE_COMMAND_ERROR_MISSING_CONTENT: `Sorry, that Message has no content to it!\n-# *I can only search for temperatures in the actual content of the Message. Not in Embeds, Polls, etc!*`,
    TEMPERATURE_COMMAND_ERROR_TEMPERATURE_NOT_FOUND: `Sorry, but I couldn't find any temperatures to convert from that Message.\n-# *I can only search for temperatures in the actual content of the Message. Not in Embeds, Polls, etc!*`,
    TEMPERATURE_COMMAND_ERROR_EXCEEDED_TEMPERATURE_LIMIT: `Sorry, but there are too many temperatures found in that Message!\nI have a maximum limit of 10 temperatures per Message that I can convert.`,
    TEMPERATURE_COMMAND_ERROR_POLLS_NOT_SUPPORTED: `Sorry, I currently do not support converting temperatures inside of Polls.`,
    TEMPERATURE_COMMAND_ERROR_FORWARDS_NOT_SUPPORTED: `Sorry, I currently do not support converting temperatures inside of Forwarded Messages.`,



    // ******* ADD APP COMMAND
    ADD_APP_COMMAND_RESPONSE: `Use the below link to add TwiLite to either your Server or your Profile!\n\n[Add TwiLite]( {{0}} )`,

    
    
    // ******* SUPPORT COMMAND
    SUPPORT_COMMAND_RESPONSE: `Need help/support with using TwiLite? Or maybe you want to report an issue or suggest an idea for TwiLite?\nFeel free to ask/post on the Issues or Discussions tab of TwiLite's GitHub (linked below).`,
    SUPPORT_COMMAND_BUTTON_GITHUB_LABEL: `Open GitHub`,



    // ******* SUBSCRIBE COMMAND
    NEWS_SUBSCRIBE_COMMAND_SUCCESS: `Successfully followed this Channel ( {{0}} ) to TwiLite's Announcements Feed!\n\nYou can edit and/or unfollow this Feed at any time by going into **Server Settings > Integrations > Channels Followed**.`,

    NEWS_SUBSCRIBE_COMMAND_ERROR_MISSING_PERMISSION_VIEW_CHANNEL: `Sorry, TwiLite needs the "**View Channel**" Permission in this Channel to be able to follow its Announcements Feed here.`,
    NEWS_SUBSCRIBE_COMMAND_ERROR_MISSING_PERMISSION_MANAGE_WEBHOOKS: `Sorry, TwiLite needs the "**Manage Webhooks**" Permission in this Channel to be able to follow its Announcements Feed here.\n\n*(This Permission can be revoked from TwiLite again afterwards)*`,
    NEWS_SUBSCRIBE_COMMAND_ERROR_NOT_A_TEXT_CHANNEL: `Sorry, you can only follow a regular Text Channel to TwiLite's Announcements Feed.\nPlease try using this Channel again in a Text Channel.`,
    NEWS_SUBSCRIBE_COMMAND_ERROR_GENERIC: `Sorry, something went wrong while trying to follow this Channel to TwiLite's Announcements Feed.`,



    // ******* LOCK EMOJI COMMAND
    LOCKEMOJI_COMMAND_AUDIT_LOG_EMOJI_UPLOADED: `Role-locked Custom Emoji uploaded by {{0}} using TwiLite`,
    LOCKEMOJI_COMMAND_UPLOAD_SUCCESS: `Successfully uploaded your new Role-locked Custom Emoji to this Server.\nYou can rename and/or delete your Emoji, much like others, in Server Settings > Emojis, providing you have the **Manage Expressions** Permission.`,

    //LOCKEMOJI_COMMAND_ERROR_MISSING_CREATE_EXPRESSIONS_PERMISSION: `Sorry, but I cannot upload a Custom Emoji to this Server without having the **Create Expressions** Permission.\nPlease try again, once I have been granted that Permission!`, // Unused while Discord's API still has Apps use Manage Expressions instead of Create Expressions
    LOCKEMOJI_COMMAND_ERROR_MISSING_MANAGE_EXPRESSIONS_PERMISSION: `Sorry, but I cannot upload a Custom Emoji to this Server without having the **Manage Expressions** Permission.\nPlease try again, once I have been granted that Permission!`,
    LOCKEMOJI_COMMAND_ERROR_INVALID_FILE_TYPE: `Sorry, but that Emoji file wasn't a **PNG**, **JPEG**, or **GIF** file type.\nPlease try again, ensuring you use either a \`.png\`, \`.jpeg\`, or \`.gif\` file for your Custom Emoji.`,
    LOCKEMOJI_COMMAND_ERROR_FILE_TOO_LARGE: `Sorry, but that Emoji file is too large to be uploaded as a Custom Emoji.\nDiscord requires Custom Emojis to be smaller than 256kb in file size. Please try again, once you have a smaller file size for your Custom Emoji.`,
    LOCKEMOJI_COMMAND_ERROR_GENERIC: `Whoops, an error occurred while trying to upload that Role-locked Custom Emoji.`,



    // ******* DISCORD OUTAGE NOTIFIER MODULE
    DISCORD_STATUS_COMMAND_FOLLOW_SUCCESS: `Successfully followed Discord's Status Page!\nAny Discord outages or status issues will now be posted in the {{0}} Channel.`,
    DISCORD_STATUS_COMMAND_FOLLOW_SUCCESS_AUDIT_LOG: `{{0}} followed Discord's Status Page using TwiLite`,
    DISCORD_STATUS_COMMAND_UNFOLLOW_SUCCESS: `Successfully unfollowed Discord's Status Page.\nThis Server will no longer receive notifications (from TwiLite) about Discord's outages & status issues.{{0}}`,
    DISCORD_STATUS_COMMAND_UNFOLLOW_SUCCESS_AUDIT_LOG: `{{0}} unfollowed Discord's Status Page using TwiLite`,
    
    DISCORD_STATUS_COMMAND_ERROR_WEBHOOK_DELETION_FAILED: `An error occurred while trying to delete the Webhook for my Discord Outage Notifier.\nYou will have to manually delete the Webhook in Server Settings -> Integrations -> TwiLite -> Webhooks`,
    DISCORD_STATUS_COMMAND_ERROR_INVALID_CHANNEL_TYPE: `Sorry, you cannot add my Discord Outage Notifier to this Channel.\nPlease try again, ensuring you are running this Command in either a Text Channel, a Public Thread (within a Text Channel), or a Forum Post.`,
    DISCORD_STATUS_COMMAND_ERROR_MISSING_PERMISSION_VIEW_CHANNEL: `Whoops - looks like I don't have the "**View Channel**" Permission for this Channel.\nI need both this, and the "**Manage Webhooks**", Permissions in this Channel to be able to add my Discord Outage Notifier here.`,
    DISCORD_STATUS_COMMAND_ERROR_MISSING_PERMISSION_MANAGE_WEBHOOKS: `Whoops - looks like I don't have the "**Manage Webhooks**" Permission for this Channel.\nI need this Permission in this Channel in order to add my Discord Outage Notifier here.`,
    DISCORD_STATUS_COMMAND_ERROR_ALREADY_FOLLOWING: `This Server is already following my Discord Outage Notifier!\nIf you want to disable the Discord Outage Notifier in this Server, please use the {{0}} Command.`,
    DISCORD_STATUS_COMMAND_ERROR_NOT_CURRENTLY_FOLLOWING: `This Server is **not** currently following my Discord Outage Notifier.`,
    
    DISCORD_STATUS_COMMAND_ERROR_FOLLOW_GENERIC: `Sorry, but something went wrong while trying to follow my Discord Outage Notifier in this Channel...`,
    DISCORD_STATUS_COMMAND_ERROR_UNFOLLOW_GENERIC: `Sorry, but something went wrong while trying to unfollow this Channel from my Discord Outage Notifier...`,
}
