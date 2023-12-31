import express from "express";
import { Auth } from "googleapis";
import { runBotService } from "./bot_worker.js";


const oauth2client = new Auth.OAuth2Client({
});

const app = express();

const scopes = [
    "https://www.googleapis.com/auth/youtube.readonly",
];


app.get("/", (_req, res) => {
    res.send("Server is up!");
});

app.get("/request_token", (req, res) => {
    const url = oauth2client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        redirect_uri: oauth2client.redirectUri,
    });

    res.contentType = "text/html";
    res.send(`<a href="${url}">Start google apis auth</a>`);
});

app.get("/oauth2callback", (req, res) => {
    res.send(`OAuth callback was called => ${req.query['code']}`);
});

runBotService();


app.listen(3000, () => {
    console.log("App is started on port 3000");
});
