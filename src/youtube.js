
module.exports.extractChannel = function(channelLink) {
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

module.exports.getYoutubeLink = function(channel) {
    return `https://www.youtube.com/@${channel}`
}