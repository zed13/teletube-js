const { Telegraf } = require("telegraf")
const { Storage } = require('./database.js')
const { Auth } = require("googleapis");
const { extractChannel, getYoutubeLink } = require('./youtube.js')

const storage = Storage.memory()
const bot = new Telegraf(process.env.BOT_TOKEN);

// Uncomment to enable logs
// bot.use(Telegraf.log());

bot.start(ctx => {
    storage.users.getOrCreateWith(ctx.message.from.id)
    ctx.reply("This bot help you get updates from youtube subscriptions.")
})

const oauth2client = new Auth.OAuth2Client({
    clientId: "1005400647137-02h4tc9kjoqmi0nh775mfbstqrvmnkdr.apps.googleusercontent.com",
    clientSecret: "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",
    redirectUri: "http://localhost:3000/oauth2callback",
});

bot.command(["add", "add_channel"], ctx => {
    console.log(ctx.message.text);
    const message = ctx.message.text;
    const commandArg = extractValue(message, ['add', 'add_channel'])
    console.log(`Channel candedate is ${commandArg}`)
    const channel = extractChannel(commandArg);
    console.log(`User specify channel => ${channel}`)
    const user = storage.users.getOrCreateWith(ctx.message.from.id)
    if (user != null && channel != null) {
        storage.channels.addChannel(channel, ctx.message.from.id)
        storage.channels.bindChannel(channel, user)
        ctx.reply(`Channel ${channel} is successfully added to your list`)
    } else {
        ctx.reply(`Failed to add channel to your list`);
    }
});

bot.command(['ls', 'list_channels'], (ctx) => {
    let reply = '';
    console.log('/ls start handling new message')
    const user = storage.users.getOrCreateWith(ctx.message.from.id)
    console.log(`/ls for user => ${JSON.stringify(user, null, 2)}`)
    const channels = storage.channels.getChannelsForUser(user)
    console.log(`/ls user channels list => ${JSON.stringify(channels, null, 2)}`)
    if (channels.length > 0) {
        for (const channel of channels) {
            reply += `* ${getYoutubeLink(channel)}\n`
        }
        ctx.replyWithHTML(`Your channels:\n${reply}`)
    } else {
        ctx.reply('No channels were added yet')
    }
});

function extractValue(rawMessage, commands) {
    if (!rawMessage.startsWith('/')) {
        return null;
    }
    const message = rawMessage.slice(1, rawMessage.length);
    const sortedCommands = commands.sort((a, b) => b.length - a.length);
    for (const command of sortedCommands) {
        if (message.startsWith(command)) {
            return message.slice(command.length).trim();
        }
    }
    return null;
}


bot.launch();

// Enable graceful stop