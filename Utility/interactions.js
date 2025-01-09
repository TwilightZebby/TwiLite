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
}

export const Modals = {
    //.
}
