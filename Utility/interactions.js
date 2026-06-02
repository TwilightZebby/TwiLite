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
    'bite': () => import('../Commands/SlashCommands/Actions/bite.js'),
    'lick': () => import('../Commands/SlashCommands/Actions/lick.js'),
    'glare': () => import('../Commands/SlashCommands/Actions/glare.js'),
    'explode': () => import('../Commands/SlashCommands/Actions/explode.js'),
    'fish': () => import('../Commands/SlashCommands/Actions/fish.js'),

    // ***** FOR ROLE MENUS
    'rolemenu': () => import('../Commands/SlashCommands/RoleMenus/rolemenu.js'),

    // ***** FOR GENERAL COMMANDS
    'add-app': () => import('../Commands/SlashCommands/General/add-app.js'),
    'follow-news': () => import('../Commands/SlashCommands/General/follow-news.js'),
    'invite-guest': () => import('../Commands/SlashCommands/General/invite-guest.js'),
    'support': () => import('../Commands/SlashCommands/General/support.js'),
    'temperature': () => import('../Commands/SlashCommands/General/temperature.js'),

    // ***** FOR MANAGEMENT COMMANDS
    'lock-emoji': () => import('../Commands/SlashCommands/Management/lock-emoji.js'),

    // ***** FOR SOCIAL COMMANDS
    'notifier': () => import('../Commands/SlashCommands/Social/notifier.js'),

    // ***** FOR PREMIUM COMMANDS
    'branding': () => import('../Commands/SlashCommands/Premium/branding.js'),

    // ***** FOR DEVELOPER COMMANDS
    'inferno': () => import('../Commands/SlashCommands/Developer/inferno.js'),
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

    // ***** FOR SOCIAL
    'twitch': () => import('../Interactions/Buttons/Social/twitch.js'),

    // ***** FOR PREMIUM
    'branding': () => import('../Interactions/Buttons/Premium/branding.js'),
}

export const Selects = {
    // ***** FOR ROLE MENUS
    'create-role-menu': () => import('../Interactions/Selects/RoleMenus/create-role-menu.js'),
    'configure-role-menu': () => import('../Interactions/Selects/RoleMenus/configure-role-menu.js'),
}

export const Modals = {
    // ***** FOR ROLE MENUS
    'menu-add-requirement': () => import('../Interactions/Modals/RoleMenus/menu-add-requirement.js'),
    'menu-add-role': () => import('../Interactions/Modals/RoleMenus/menu-add-role.js'),
    'menu-edit-button': () => import('../Interactions/Modals/RoleMenus/menu-edit-button.js'),
    'menu-remove-requirement': () => import('../Interactions/Modals/RoleMenus/menu-remove-requirement.js'),
    'menu-remove-role': () => import('../Interactions/Modals/RoleMenus/menu-remove-role.js'),
    'menu-set-details': () => import('../Interactions/Modals/RoleMenus/menu-set-details.js'),
    'menu-set-type': () => import('../Interactions/Modals/RoleMenus/menu-set-type.js'),

    // ***** FOR SOCIAL
    'twitch': () => import('../Interactions/Modals/Social/twitch.js'),

    // ***** FOR PREMIUM
    'branding': () => import('../Interactions/Modals/Premium/branding.js'),
}
