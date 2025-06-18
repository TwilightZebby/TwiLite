export const SlashCommands = {
    // ***** ACTION COMMANDS
    'bonk': () => import('../Commands/SlashCommands/Actions/bonk.js'),
    'boop': () => import('../Commands/SlashCommands/Actions/boop.js'),
    'cookie': () => import('../Commands/SlashCommands/Actions/cookie.js'),
    'headpat': () => import('../Commands/SlashCommands/Actions/headpat.js'),
    'hug': () => import('../Commands/SlashCommands/Actions/hug.js'),
    'jail': () => import('../Commands/SlashCommands/Actions/jail.js'),
    'kiss': () => import('../Commands/SlashCommands/Actions/kiss.js'),
    'slap': () => import('../Commands/SlashCommands/Actions/slap.js'),
    'yeet': () => import('../Commands/SlashCommands/Actions/yeet.js'),

    // ***** FOR ROLE MENUS
    'rolemenu': () => import('../Commands/SlashCommands/RoleMenus/rolemenu.js'),

    // ***** FOR GENERAL COMMANDS
    'add-app': () => import('../Commands/SlashCommands/General/add-app.js'),
    'follow-news': () => import('../Commands/SlashCommands/General/follow-news.js'),
    'support': () => import('../Commands/SlashCommands/General/support.js'),
    'temperature': () => import('../Commands/SlashCommands/General/temperature.js'),
    'discord-outage-feed': () => import('../Commands/SlashCommands/General/discord-outage-feed.js'),

    // ***** FOR MANAGEMENT COMMANDS
    'lock-emoji': () => import('../Commands/SlashCommands/Management/lock-emoji.js'),
}

export const ContextCommands = {
    // ***** FOR ACTION COMMANDS
    'Bonk User': () => import('../Commands/ContextCommands/Actions/Bonk_User.js'),
    'Boop User': () => import('../Commands/ContextCommands/Actions/Boop_User.js'),
    'Headpat User': () => import('../Commands/ContextCommands/Actions/Headpat_User.js'),
    'Kiss User': () => import('../Commands/ContextCommands/Actions/Kiss_User.js'),

    // ***** FOR ROLE MENUS
    'Delete Role Menu': () => import('../Commands/ContextCommands/RoleMenus/Delete_Role_Menu.js'),
    'Edit Role Menu': () => import('../Commands/ContextCommands/RoleMenus/Edit_Role_Menu.js'),

    // ***** FOR GENERAL COMMANDS
    'Convert Temperature': () => import('../Commands/ContextCommands/General/Convert_Temperature.js'),
}

export const Autocompletes = {
    //.
}

export const Buttons = {
    // ***** FOR ACTION MODULE
    'return-action': () => import('../Interactions/Buttons/Actions/return-action.js'),
    'jail': () => import('../Interactions/Buttons/Actions/jail.js'),

    // ***** FOR ROLE MENUS
    'role': () => import('../Interactions/Buttons/RoleMenus/role.js'),
    'menu-delete': () => import('../Interactions/Buttons/RoleMenus/menu-delete.js'),
}

export const Selects = {
    // ***** FOR ROLE MENUS
    'create-role-menu': () => import('../Interactions/Selects/RoleMenus/create-role-menu.js'),
    'configure-role-menu': () => import('../Interactions/Selects/RoleMenus/configure-role-menu.js'),
    'menu-set-type': () => import('../Interactions/Selects/RoleMenus/menu-set-type.js'),
    'menu-add-role': () => import('../Interactions/Selects/RoleMenus/menu-add-role.js'),
    'menu-add-button': () => import('../Interactions/Selects/RoleMenus/menu-add-button.js'),
    'menu-remove-role': () => import('../Interactions/Selects/RoleMenus/menu-remove-role.js'),
    'menu-add-requirement': () => import('../Interactions/Selects/RoleMenus/menu-add-requirement.js'),
    'menu-remove-requirement': () => import('../Interactions/Selects/RoleMenus/menu-remove-requirement.js'),
}

export const Modals = {
    // ***** FOR ROLE MENUS
    'menu-button-text': () => import('../Interactions/Modals/RoleMenus/menu-button-text.js'),
    'menu-embed': () => import('../Interactions/Modals/RoleMenus/menu-embed.js'),
    'menu-edit-button': () => import('../Interactions/Modals/RoleMenus/menu-edit-button.js'),
}
