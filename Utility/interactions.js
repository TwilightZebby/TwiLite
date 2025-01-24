export const SlashCommands = {
    // ***** ACTION COMMANDS
    'bonk': () => import('../Commands/SlashCommands/Actions/bonk.js'),
    'boop': () => import('../Commands/SlashCommands/Actions/boop.js'),
    'cookie': () => import('../Commands/SlashCommands/Actions/cookie.js'),
    'headpat': () => import('../Commands/SlashCommands/Actions/headpat.js'),
    'hug': () => import('../Commands/SlashCommands/Actions/hug.js'),
    'kiss': () => import('../Commands/SlashCommands/Actions/kiss.js'),
    'yeet': () => import('../Commands/SlashCommands/Actions/yeet.js'),

    // ***** FOR ROLE MENUS
    'rolemenu': () => import('../Commands/SlashCommands/RoleMenus/rolemenu.js'),
}

export const ContextCommands = {
    //.
}

export const Autocompletes = {
    //.
}

export const Buttons = {
    // ***** FOR ROLE MENUS
    'role': () => import('../Interactions/Buttons/role.js'),
}

export const Selects = {
    // ***** FOR ROLE MENUS
    'create-role-menu': () => import('../Interactions/Selects/RoleMenus/create-role-menu.js'),
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
}
