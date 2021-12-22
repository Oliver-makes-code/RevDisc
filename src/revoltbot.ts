import * as revolt from "revolt.js";

export function start(token: string): revolt.Client {
    let client = new revolt.Client();
    client.loginBot(token);
    return client;
}