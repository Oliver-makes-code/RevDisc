import * as discord from "discord.js";

export function start(token: string): discord.Client {
    let client = new discord.Client({
        intents: [
            discord.Intents.FLAGS.GUILD_MESSAGES,
            discord.Intents.FLAGS.GUILD_WEBHOOKS,
        ]
    });
    client.login(token);
    return client;
}