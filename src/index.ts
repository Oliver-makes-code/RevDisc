import * as discord from "discord.js";
import * as revolt from "revolt.js";
import * as fs from "fs";
import * as discordBot from "./discordbot";
import * as revoltBot from "./revoltbot";

type Keys = {
    discord: string
    revolt: string
}
export const keys: Keys = JSON.parse(fs.readFileSync("./keys.json").toString());

const channels: Keys = {
    discord: "887139925890314263",
    revolt: "01FEXPHJH4WSVXFG12SVJV17G7"
}

const discordClient = discordBot.start(keys.discord);
const revoltClient = revoltBot.start(keys.revolt);

discordClient.on("messageCreate", msg => {
    if (msg.channelId != channels.discord) return;
    if (msg.webhookId || msg.author.bot) return;
    revoltClient.channels.$get(channels.revolt).sendMessage(msg.member?.displayName + ": " + msg.content);
});

revoltClient.on("message", msg => {
    if (msg.channel_id != channels.revolt) return;
    if (msg.author?.bot) return;
    discordClient.channels.fetch(channels.discord).then(c => {
        if (!c?.isText) return;
        let channel: discord.TextChannel = c as discord.TextChannel;
        channel.fetchWebhooks().then(h => {
            let hooks = h.map(e => e);
            for (let hook of hooks) {
                if (hook.owner?.id != discordClient.user?.id) continue;
                hook.send({
                    content: msg.content.toString(),
                    username: (msg.member?.nickname? msg.member?.nickname: msg.author?.username) + " | Revolt.chat",
                    avatarURL: msg.member?.generateAvatarURL()? msg.member?.generateAvatarURL(): msg.author?.generateAvatarURL()? msg.author?.generateAvatarURL(): msg.author?.defaultAvatarURL
                });
                return;
            }
            channel.createWebhook("RevDisc webook").then(hook => {
                hook.send({
                    content: msg.content.toString(),
                });
            })
        });
    })
})