const { Telegraf, Markup } = require("telegraf")
const { Storage } = require('./database.js')
const { Auth } = require("googleapis");
const { extractChannel, getYoutubeLink, searchChannel } = require('./youtube.js')

const storage = Storage.memory()

console.log(`Reading bot token from env variable BOT_TOKEN=${process.env.BOT_TOKEN}`)
const bot = new Telegraf(process.env.BOT_TOKEN);

// Uncomment to enable logs
// bot.use(Telegraf.log());

bot.start(ctx => {
    storage.users.getOrCreateWith(ctx.message.from.id)
    ctx.reply("This bot help you get updates from youtube subscriptions.")
})

function buildChannelSearchVariants(searchResposne) {
    const keyboard = []
    for (const channel of searchResposne.data.items) {
        keyboard.push([Markup.callbackButton(channel.snippet.channelTitle, `new_channel_${channel.id.channelId}`)])
    }
    return Markup.inlineKeyboard(keyboard)
        .extra()
}

bot.command(["add", "add_channel"], async (ctx) => {
    console.log(ctx.message.text);
    const message = ctx.message.text;
    const commandArg = extractValue(message, ['add', 'add_channel'])
    console.log(`Channel candedate is ${commandArg}`)
    const channel = extractChannel(commandArg);
    console.log(`User specify channel => ${channel}`)
    const user = storage.users.getOrCreateWith(ctx.message.from.id)
    try {
        const searchResponse = await searchChannel(channel)
        console.log(`channel '${channel} is found on youtube; resposne => ${JSON.stringify(searchResponse, null, 2)}'`)
        ctx.reply(`Find channels for name ${channel}`, buildChannelSearchVariants(searchResponse))
    } catch (err) {
        console.log(`Error on attempt to request channel ${channel}`)
        console.log(err)
    }
    // if (user != null && channel != null) {
    //     storage.channels.addChannel(channel, ctx.message.from.id)
    //     storage.channels.bindChannel(channel, user)
    //     ctx.reply(`Channel ${channel} is successfully added to your list`)
    // } else {
    //     ctx.reply(`Failed to add channel to your list`);
    // }
});

bot.action(/new_channel_+/, (ctx) => {
    const channelId = ctx.match.input.substring(13)
    ctx.editMessageReplyMarkup(Markup.removeKeyboard())
    ctx.reply(`Channel with id=${channelId} is selected`)
})

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