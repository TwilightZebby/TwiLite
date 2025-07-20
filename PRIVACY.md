# TwiLite - Privacy Policy
Last Updated: 20th July 2025

Effective: ?? August 2025 (Date to be confirmed once update is ready for release)

---

## Introduction
**TwiLite** does __not__, and will __never__, collect & store Messages, User Data, or Server Data without explicit notice & consent.
Additionally, **TwiLite** will __never__ sell or give away the Data that it does store.

The developers of **TwiLite** firmly believes in a "we don't want your data keep it away from us" process - thus, **TwiLite** will be developed as "stateless" as possible (i.e: without needing to store any information or data at all). If features and functions are not possible to develop "stateless", we will explicitly include them in this **Privacy Policy**, covering exactly what is needed to be stored, for what purpose, and how that data can be removed from **TwiLite** on request.

**TwiLite**'s source code is viewable in **TwiLite**'s GitHub Repo ( https://github.com/TwilightZebby/TwiLite ).

---

## Data Collection & Purposes
TwiLite currently does *not* collect or store *any* data or information from any Users or Servers that use or interact with TwiLite, apart from what is listed below.

### Logging
**TwiLite** will log when it has been added (otherwise referred to as authorized) or removed (or "deauthorized") as a Server App to a Discord Server or as a User App to a User's account.

The only information included in this log are:
- **When added as a Server App:**
  - Which User added **TwiLite** to a Server (specifically, the User's display/user name, and ID)
  - Which Server **TwiLite** was added to (specifically, the Server's name & ID)
  - and which Scopes **TwiLite** was authorized with (commonly `application.commands` for its Slash Commands, and `bot` for its Bot User)
- **When added as a User App:**
  - Which User added **TwiLite** as a User App (specifically, the User's display/user name, and ID)
  - and which Scopes **TwiLite** was authorized with (commonly `application.commands` for its Slash Commands, and `bot` for its Bot User)
- **When removed as a User App:**
  - Which User removed **TwiLite** as a User App (specifically, the User's display/user name, and ID)

This is purely for informational purposes (such as tracking the App's growth), and this information will NOT be given or sold to anyone else.

### Discord Outage Notifier Module
**TwiLite** offers an **opt-in** Module Servers can use (when **TwiLite** is added as a Server App) to have Discord's outage notices auto-posted into a Text Channel of choice. This is done via the `/discord-outage-feed` Slash Command.

When opted-in, **TwiLite** will require storing the following data in order for this Module to function:
- **The Server's ID** of the Server opting-in to this Module
- **The Channel's ID** of the Channel the Server wants this Module to post in
- **The Webhook's ID & Token** of the Webhook **TwiLite** will create within the Channel for this Module to post via

Servers can, at any time, opt back out of this Module (and thus, no longer receive notifications for Discord's outages) via the same `/discord-outage-feed` Slash Command. Opting out of this Module **will** remove the aforementioned data from **TwiLite** within the context of this Module.

The stored data will NOT be given or sold to anyone else, for any reason.

---

## Use of Locale Data
**TwiLite** makes use of the publicly available locale data (i.e: what language Users and Servers have set) Discord sends to all Server/User Apps using Discord's public API for "Interactions" (e.g: Slash Commands, Context Commands, Select Menus, Buttons, Modals). This locale data is only used for knowing which language **TwiLite** should send its responses in, and is __NOT__ stored or tracked in any way.

You can see the public API Documentation regarding what the locale data includes on these official Discord API Documentation Pages:
- [API Locale Reference](https://discord.com/developers/docs/reference#locales)
- [Locale field in Interaction Objects](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object)

---

## Final Notes
Due to limitations with **TwiLite** being hosted on CloudFlare Workers & how Discord's API works for HTTP-only Apps, **TwiLite** will not be able automatically remove any stored Server or User data when removed or de-authorised from said Server or User.

If you want to have such data removed, you can do so via usage of **TwiLite**'s commands. The relevant commands are named in above sections of this Policy.

Should you have added **TwiLite** to your Discord Account as a User App, and you no longer want it as a User App, you can freely remove it again at any time by navigating to Discord's User Settings -> Authorized Apps, and revoking **TwiLite** from that page.

The Developer of **TwiLite**, TwilightZebby, is contactable for matters regarding **TwiLite** via GitHub, preferrably via opening an Issue Ticket or Discussion on **TwiLite**'s [GitHub Repo](https://github.com/TwilightZebby/TwiLite).

Please also see [Discord's own Privacy Policy](https://discord.com/privacy).

*This Privacy Policy is subject to change at any time.*
