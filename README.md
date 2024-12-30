# TwiLite

A general-purpose Discord App made by TwilightZebby.

- [Add TwiLite to your Server](https://discord.com/api/oauth2/authorize?client_id=784058687412633601&permissions=274878221312&scope=applications.commands%20bot)
- [Add TwiLite as a User App to your Account](https://discord.com/api/oauth2/authorize?client_id=784058687412633601&scope=applications.commands&integration_type=1)

---

# THE LICENSE
The License for this Project, and all of TwilightZebby's Projects, can be [found here](https://github.com/TwilightZebby/license/blob/main/license.md).

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

# Features List

## Action Commands
| Command | Description |
|------------|-------------|
| `/bonk` | Bonks the specified User, Role, or everyone |
| `/boop` | Boops the specified User, Role, or everyone |
| `/cookie` | Gives the specified User, Role, or everyone a cookie! |
| `/headpat` | Gives the specified User, Role, or everyone a headpat |
| `/hug` | Gives the specified User, Role, or everyone a hug |
| `/kiss` | Gives a kiss to the specified User, Role, or everyone |
| `/yeet` | Yeets (throws) the specified User, Role, or everyone |

## Management Features
| Feature | Command | Description |
|---------|------------|-------------|
| Role Menus | - | Create self-assignable Role Menus that your Server Members can use to grant or revoke Roles for themselves |

> [!NOTE]
> Currently, Role Menus have to be manually created by TwiLite's developer - TwilightZebby. He is working on re-adding the Commands used to create/edit your own Role Menus without his assistance needed.

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
> Now that the App is being used for more features, which are less action-based (such as Button-Roles or the Temperature Convertor), TwilightZebby thought a name change was in order since "Actions Bot" isn't accurate anymore.
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