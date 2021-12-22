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
    discord: "872269002259464232",
    revolt: "01FQHRN0TAXHQZZ43DC0X8DMY3"
}

let discordWebhook: discord.Webhook;

const discordClient = discordBot.start(keys.discord);
const revoltClient = revoltBot.start(keys.revolt);

discordClient.on("messageCreate", msg => {
    if (msg.channelId != channels.discord) return;
    if (msg.webhookId || msg.author.bot) return;
    let sent = false;
    revoltClient.channels.fetch(channels.revolt).then(channel => {
        if (sent) return;
        let attach = msg.attachments.map(a => a.url);
        let dat = msg.member?.displayName + ": " + msg.cleanContent
        if (dat) channel.sendMessage(dat);
        for (let i of attach)
            channel.sendMessage(i);
        sent = true;
    });
});

function sleep(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

revoltClient.on("message", msg => {
    if (msg.channel_id != channels.revolt) return;
    if (msg.author?._id == revoltClient.user?._id) return;
    discordClient.channels.fetch(channels.discord).then(c => {
        if (!c?.isText) return;
        let channel: discord.TextChannel = c as discord.TextChannel;
        channel.fetchWebhooks().then(async h => {
            let hooks = h.map(e => e);
            let sent = false;
            for (let hook of hooks) {
                if (hook.owner?.id != discordClient.user?.id) continue;
                discordWebhook = hook;
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
                let attach: string[] = [];
                for (let i of msg.attachments? msg.attachments: []) {
                    attach.push("https://autumn.revolt.chat/attachments/"+i._id+"/"+i.filename);
                }
                sleep(50);
                hook.send({
                    content: content? content: undefined,
                    username: (msg.member?.nickname? msg.member?.nickname: msg.author?.username) + " | Revolt.chat",
                    avatarURL: msg.member?.generateAvatarURL()? msg.member?.generateAvatarURL(): msg.author?.generateAvatarURL()? msg.author?.generateAvatarURL(): msg.author?.defaultAvatarURL,
                    files: attach
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