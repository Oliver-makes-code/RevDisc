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
    let sent = false
    revoltClient.channels.fetch(channels.revolt).then(channel => {
        if (sent) return;
        channel.sendMessage(msg.member?.displayName + ": " + msg.cleanContent);
        sent = true;
    });
});

revoltClient.on("message", msg => {
    if (msg.channel_id != channels.revolt) return;
    if (msg.author?.bot) return;
    discordClient.channels.fetch(channels.discord).then(c => {
        if (!c?.isText) return;
        let channel: discord.TextChannel = c as discord.TextChannel;
        channel.fetchWebhooks().then(async h => {
            let hooks = h.map(e => e);
            let sent = false;
            for (let hook of hooks) {
                if (hook.owner?.id != discordClient.user?.id) continue;
                let content = msg.content.toString();
                for (let i of msg.mention_ids? msg.mention_ids: []) {
                    let user = await revoltClient.users.fetch(i);
                    content = content.replace("<@"+i+">", "@" + user.username);
                }
                while (/<#[A-Z0-9]{26}>/.test(content)) {
                    let idxStart = content.search(/<#[A-Z0-9]{26}>/) + 2;
                    let idxEnd = idxStart + 26;
                    let id = content.substring(idxStart,idxEnd);
                    let channel = await revoltClient.channels.fetch(id);
                    content = content.replace("<#"+id+">", "#"+channel.name);
                }
                hook.send({
                    content,
                    username: (msg.member?.nickname? msg.member?.nickname: msg.author?.username) + " | Revolt.chat",
                    avatarURL: msg.member?.generateAvatarURL()? msg.member?.generateAvatarURL(): msg.author?.generateAvatarURL()? msg.author?.generateAvatarURL(): msg.author?.defaultAvatarURL
                });
                sent = true;
                break;
            }
            if (!sent) {
                channel.createWebhook("RevDisc webook").then(hook => {
                    hook.send({
                        content: msg.content.toString(),
                    });
                })
            }
        });
    })
})