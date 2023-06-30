
const fs = require('node:fs')
const { google } = require('googleapis')


const youtube = google.youtube('v3')

module.exports.extractChannel = function (channelLink) {
    const patterns = [
        /^https:\/\/(www.)?youtube.com\/@?(?<channel_name>\w+)$/,
        /^(www.)youtube.com\/@(?<channel_name>\w+)$/,
        /^@(?<channel_name>\w+)$/,
    ];

    for (const pattern of patterns) {
        const result = pattern.exec(channelLink)?.groups?.channel_name || null
        if (result !== null) {
            return result
        }
    }
    return null
}

module.exports.getYoutubeLink = function (channel) {
    return `https://www.youtube.com/@${channel}`
}

function readSecret() {
    try {
        const content = fs.readFileSync('client_secret.json')
        return JSON.parse(content)
    } catch (err) {
        console.log('Failed to read file with googleapis creds')
        console.log(err)
        throw err
    }
}

async function init() {

    const auth = new google.auth.GoogleAuth({
        keyFilename: 'config_service_account.json',

        // Scopes can be specified either as an array or as a single, space-delimited string.
        scopes: [
            'https://www.googleapis.com/auth/youtube.readonly',
        ],
    });

    // Acquire an auth client, and bind it to all future calls
    const authClient = await auth.getClient();
    google.options({ auth: authClient });
}

async function searchChannel(name) {
    return youtube.search.list({
        part: 'snippet',
        type: 'channel',
        q: name,
    })
}
module.exports.searchChannel = searchChannel


init().catch((err) => {
    console.log(`youtube module failed to init bacause of ${err}`)
    throw err
})


// init().then((_) => searchChannel('NetworkChuck'))
//     .then((response) => console.log(`response => ${JSON.stringify(response, null, 2)}`))
//     .catch(console.log)
