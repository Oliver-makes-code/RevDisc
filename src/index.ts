import * as discordBot from "./discordbot";
import * as revoltBot from "./revoltbot";
import * as fs from "fs";

type Keys = {
    discord: string
    revolt: string
}
let keys: Keys = JSON.parse(fs.readFileSync("../keys.json").toString());

const discordClient = discordBot.start(keys.discord);
const revoltClient = revoltBot.start(keys.revolt);
