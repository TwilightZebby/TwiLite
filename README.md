# TwiLite

A general-purpose Discord App made by TwilightZebby.

- [Add TwiLite to your Server](https://discord.com/api/oauth2/authorize?client_id=784058687412633601&permissions=274878221312&scope=applications.commands%20bot)
- [Add TwiLite as a User App to your Account](https://discord.com/api/oauth2/authorize?client_id=784058687412633601&scope=applications.commands&integration_type=1)
- Or use this [Fancy Add App link](https://discord.com/api/oauth2/authorize?client_id=784058687412633601) which includes both of the above options

---

# THE LICENSE
The License for this Project, and all of TwilightZebby's Projects, can be [found here](https://github.com/TwilightZebby/license/blob/main/license.md).

---

# Contributing
Want to help localise TwiLite into more languages? Feel free to open a [Pull Request](https://github.com/TwilightZebby/TwiLite/pulls) to do so!
Please remember that only languages supported by Discord (as noted on [their API Documentation here](https://discord.com/developers/docs/reference#locales)) are supported by TwiLite.

If you want to localise the command/interaction responses:
1. Go into the `/Locales/` folder
2. Copy the `en-GB.cjs` file, paste a duplicate within that same folder, and rename it to the language you want to add (using the locale key from the "LOCALE" column on Discord's locale [Documentation table here](https://discord.com/developers/docs/reference#locales) as the file name)
  - *PLEASE remember to keep the `.cjs` file extension! Also, the original/main locale for TwiLite is `en-GB`, hence the request to use that one as the base.*
3. Be sure to also update the `appLocales` constant at the very top of `/Utility/localizeResponses.js` file, to include the new locale you are adding

If you want to localise commands themselves, you can find them in `/Commands/SlashCommands`.
**Please note:** Only localise descriptions for Commands & Command Options. Do **NOT** localise the Command/Option names, as Discord still is a little funky when handling localised Command/Option names.

---

# Features List
- Note: All listed features will note if they can be used in a User App context, or a Server App context (or both!).
  - "User App context" means features that can be used anywhere (in Servers, DMs, & GroupDMs) when TwiLite is added to your account.
  - "Server App context" means features that can only be used within Servers that have added TwiLite.

## Action Commands
> [!NOTE]
> Action Commands support being used in both Server App and User App contexts.

Just some fun little roleplay-style Commands (such as `/bonk`, `/hug`, `/boop`, etc) that you can use on your friends.

Some Action Commands can also be used via right-clicking/long-pressing on a User! These "User Command" variants exist for those who just want a quicker way of giving someone a Bonk, Boop, Headpat, or Kiss. :)

The Action Slash Commands also display a "return action" button when used. This can be prevented by setting the "`block-return`" option to `True` when using the Slash Command.

The `/jail` Action Command has Jailbreak Buttons you can enable, via use of the `include-minigame` option, which allows giving *anyone* the chance to free the jailed target.
These buttons can also be used by the jailed target and the user who sent them to jail - however, the jailed target cannot use the "Bail Freedom" Button!

## Role Menu Module
> [!NOTE]
> Role Menus can only be used within the Server App context.

Create self-assignable Role Menus for your Server Members to use.

There are three types of Role Menus that TwiLite supports:
- **Classic (aka Toggle) Role Menus** - The most basic Role Menu. Members can self-grant/revoke any and all Roles from a Toggle Role Menu.
  - *Useful for notification Roles, for example*
- **Swappable Role Menus** - Members can only have 1 Role per Swappable Menu. Attempting to select another Role on the same Swappable Menu will swap the two Roles for the Member instead.
  - *Useful for colour Roles, for example*
- **Single-use Role Menus** - Members can only use a Single-use Menu once. After use, Members cannot self-revoke or swap the selected Role from themselves from the same Menu.
  - *Useful for team Roles in Events, for example*

You can even add Requirements to Menus you make, restricting their use to those with specific Roles. An example use for this may be restricting a Role Menu to only your Supporters!
(The Server Owner, and those with the Admin Permission, will bypass any Role Menu Requirements set).

All Role Menu management can be found under the `/rolemenu` Command - including guides on how to edit or delete an existing Role Menu.

## Miscellaneous Features
TwiLite may sometimes be updated to add some general-purpose, utility, or other miscellaneous features. Currently added ones are as follows:

### Role-locking Custom Emojis
> [!NOTE]
> Ability to upload Role-locked Custom Emojis can only be done in the Server App context.

Twilite offers a `/lock-emoji` Command, that can be used by Server Admins to upload role-locked custom emojis to your Server.
This makes use of a lesser-known feature within Discord, mostly used by Discord's Twitch Integration.

When an Emoji is Role-locked, only those in the Server with the specific Role can use that Emoji in their messages. Even the Server's Owner needs to have that Role to use that Emoji!

### Temperature Conversion
> [!NOTE]
> Temperature Conversion commands supports being used in both Server App and User App contexts.

Useful for converting American temperatures (Degrees F) into more globally understood temperatures (Degrees C or K), or indeed the other way around.
There are two ways to convert temperatures using TwiLite:

- `/temperature` - the Slash Command which can be used to manually convert a single temperature
- "`Convert Temperatures`" - the [Message Context Command](https://github.com/TwilightZebby/TwiLite?tab=readme-ov-file#context-commands--where-to-find-them) which can be used to convert up to 10 temperatures from most Messages sent by Users

---

# Commands List

## Action Slash Commands
| Command | Description |
|------------|-------------|
| `/bonk` | Bonks the specified User, Role, or everyone |
| `/boop` | Boops the specified User, Role, or everyone |
| `/cookie` | Gives the specified User, Role, or everyone a cookie! |
| `/headpat` | Gives the specified User, Role, or everyone a headpat |
| `/hug` | Gives the specified User, Role, or everyone a hug |
| `/jail` | Sends the target User to jail. |
| `/kiss` | Gives a kiss to the specified User, Role, or everyone |
| `/slap` | Slaps the target User, Role, or everyone |
| `/yeet` | Yeets (throws) the specified User, Role, or everyone |

## Action User Commands
| Command | Description |
|------------|-------------|
| "`Bonk User`" | Bonks the target User |
| "`Boop User`" | Boops the target User |
| "`Headpat User`" | Gives the target User a headpat |
| "`Kiss User`" | Gives the target User a kiss |

## Management Commands
| Command Name | Command Type | Description |
|------------|-------------|-------------|
| `/rolemenu` | Slash | Create/Manage self-assignable Role Menus |
| "`Edit Role Menu`" | Message | Edit an existing Role Menu |
| "`Delete Role Menu`" | Message | Delete an existing Role Menu |
| `/lock-emoji` | Slash | Upload a Role-locked Custom Emoji, only allowing a specific Role to use the Emoji |

## General/Miscellaneous Commands
| Command Name | Command Type | Description |
|------------|-------------|-------------|
| `/temperature` | Slash | Convert a single temperature between degrees C, F, and K |
| "`Convert Temperature`" | Message | Convert up to 10 temperatures at once from a single Message |
| `/add-app` | Slash | Shows you the Add App/Invite link you can use to add TwiLite to either your Server(s) or your Account |
| `/support` | Slash | Shows you where you can gain support from TwiLite's developer, or post ideas/bug reports for TwiLite |
| `/follow-news` | Slash | Adds TwiLite's Updates & Announcements Feed to the Channel you used this Command in |

## Command Type Notes
- "Message" refers to Message Context Commands
- "User" refers to User Context Commands

For more information on Context Commands, including where to find them, please see the [below section](https://github.com/TwilightZebby/TwiLite?tab=readme-ov-file#context-commands--where-to-find-them).

---

# Notes
### Command Permissions in Servers
All of these Slash and Context Commands can be restricted to only be used by specific Users/Roles, in specific Channels, or by everyone everywhere in Server Settings > Integerations.

Sadly, though, this Settings Page is only viewable on Desktop and Web Browser versions of Discord, not Mobile App versions.

Furthermore, some of these Commands have default Permission requirements set - meaning that they won't be viewable or usable in the Command Pickers unless you have the relevant Permission (or are Server Owner, or have Admin Permission); unless an override has been set on the Command itself by the Server's Admins/Owner.

> [!NOTE]
> Please note that you can only manage App Command Permissions, as described above, for Server Apps (Apps that you have added to your Server). User Apps inherit their Permissions from the User running its Commands. If you want to prevent public responses from User Apps in your Server, simply revoke the "**Use External Apps**" Permission from your Members!

### Context Commands & Where to Find Them
By now, most Users are aware of Slash Commands (`/boop` for example) and how to use them - but not many are aware of Context Commands. Hence, this section here to explain where they are!

__Message Context Commands__ are Commands used on a specific Message in Chat, and can be found:
- **Desktop/Web:** Right-click a Message -> Apps
- **Mobile:** Long-press (press-and-hold) a Message -> Apps

__User Context Commands__ are Commands used on a specific User in Servers, and can be found:
- **Desktop/Web:** Right-click a Username or profile picture either in Chat or Member List -> Apps
- **Mobile:** Long-press (press-and-hold) a Username or profile picture in Chat or Member List -> Apps

---

# Questions
## Why did you make this App?
> This App was born from a mixture of "felt like it" and a want to bring back some of the commands from the Kawaii App.
> 
> Now, TwilightZebby aims to make this a general purpose Discord App, to add some useful stuff he and/or his friends may want/need.
> 
> The App, with its original name of "Actions Bot", was originally first added to [Dr1fterX's](https://www.twitch.tv/Dr1fterX) Server in January 2021. The App was later renamed to "MooBot" in March 2022; renamed again to "HeccBot" in May 2023, and renamed for hopefully the final time to "TwiLite" in December 2024.

## Why was the App renamed from "Actions Bot" to "MooBot"?
> The original name, "Actions Bot", was picked because of the simple nature of the App - to add action-based Slash Commands.
> Now that the App is being used for more features, which are less action-based (such as Button Role Menus or the Temperature Convertor), TwilightZebby thought a name change was in order since "Actions Bot" isn't accurate anymore.
>
> "MooBot" became the name picked as a reference to an *old* meme in [Dr1fterX's](https://www.twitch.tv/Dr1fterX) community, in which TwilightZebby was a cow (yes, as in the animal).
> That meme has long since vanished as per TwilightZebby's request. He humbly requests no one refer to him as a cow anymore because of the expiry of that meme. :)

## Why was the App renamed from "MooBot" to "HeccBot"?
> Due to Discord changing their [Username System](https://dis.gd/usernames) in early 2023, it was thought that the name "MooBot" could not be used for this App anymore, since it is already taken by a verified Discord & Twitch Bot.
> 
> Thus, TwilightZebby renamed this App to "HeccBot". However, Discord has since allowed Apps to stay on the old username system (with "username#0000" style names including discrims) - but TwilightZebby will keep the App named as "HeccBot" to help reduce conflicting names with the aforementioned Twitch Bot.

## Why was the App renamed from "HeccBot" to "TwiLite"?
> In December 2024, after thinking about the current range of Discord Apps publicly useable, Zebby realised that more and more people are preferring using Discord Apps that do one or two things well, over Apps that do everything poorly.
> 
> So, Zebby decided to have a 'restart' of sorts with his multipurpose App. It will now be made primarily for himself and his friends, but left publicly addable should anyone else want to use it.
> 
> It also gained a rename to "TwiLite" to reflect the new future of this App.

## Why are you using the term "App" instead of "Bot"?
> In April 2024, Discord made a hard-push to rename "Bots" to "Apps" (ie: "Server App", "User App", "Embedded Apps" AKA Custom Activities, etc).
> 
> While they never officially made their reasonings for that known, it can be assumed they wanted to move away from the term "Bot" due to the negative connotations the term "Bot" has, sadly, had grown upon it. *(Fuck you Twitter/Facebook/etc for that)*
> 
> I, TwilightZebby, was initially on the fence about adhering to Discord's rebranding of "Bots" into "Apps". However, I have since decided to follow suit as to not have that negative connotation with my own Discord Server/User Apps.
> 
> Hopefully, one day we will be able to reclaim the term "Bot" without its negative connotation. For now, I guess we have to stick with either "App" or "Robot". :c

## Do you have a support Server for TwiLite?
> No, I do not. However, I do have a [personal Server](https://discord.gg/nM7fJ8ZqnK) which I *guess* you could use?
> 
> **Though I'd prefer it if you kept any bug reports, support requests, and feature requests for TwiLite to this GitHub page.**
