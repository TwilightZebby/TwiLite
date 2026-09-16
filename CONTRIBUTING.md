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
