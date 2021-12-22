# RevDisc
Revolt-Discord single channel link

# Setup:
Node.js >= 17 is required.
Run `npm i`
Create a text file called `keys.json` in the root directory of the project, then have a key called `discord` with your discord bot token as the value, and then one called `revolt` with your revolt bot token as the value
Replace the IDs in `channels` in [index.ts](src/index.ts) with the channels you wish to proxy
After that is done, run `npm run build` then `npm run start` to build and start the bot
