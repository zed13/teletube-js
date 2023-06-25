

const patterns = [
    /^https:\/\/(www.)?youtube.com\/@?(?<channel_name>\w+)$/,
    /^(www.)youtube.com\/@(?<channel_name>\w+)$/,
    /^(?<channel_name>\w+)$/,
];

for (const pattern of patterns) {
    const result = pattern.exec('https://www.youtube.com/@sergeymeza')
    console.log(`${pattern.source} => ${result?.groups?.channel_name || null}`)
}

