export const SlashCommands = {
    'bonk': () => import('../Commands/SlashCommands/Actions/bonk.js'),
    'boop': () => import('../Commands/SlashCommands/Actions/boop.js'),
    'cookie': () => import('../Commands/SlashCommands/Actions/cookie.js'),
    'headpat': () => import('../Commands/SlashCommands/Actions/headpat.js'),
    'hug': () => import('../Commands/SlashCommands/Actions/hug.js'),
    'kiss': () => import('../Commands/SlashCommands/Actions/kiss.js'),
    'yeet': () => import('../Commands/SlashCommands/Actions/yeet.js'),

    'rolemenu': () => import('../Commands/SlashCommands/RoleMenus/rolemenu.js'),
}

export const ContextCommands = {
    //.
}

export const Autocompletes = {
    //.
}

export const Buttons = {
    'role': () => import('../Interactions/Buttons/role.js'),
}

export const Selects = {
    'create-role-menu': () => import('../Interactions/Selects/RoleMenus/create-role-menu.js'),
    'menu-set-type': () => import('../Interactions/Selects/RoleMenus/menu-set-type.js'),
    'menu-add-role': () => import('../Interactions/Selects/RoleMenus/menu-add-role.js'),
    'menu-add-button': () => import('../Interactions/Selects/RoleMenus/menu-add-button.js'),
}

export const Modals = {
    'menu-button-text': () => import('../Interactions/Modals/RoleMenus/menu-button-text.js'),
}
