require('google-auth-library')
const { GoogleAuth, auth, OAuth2Client } = require('google-auth-library')
const { google, GoogleApis } = require('googleapis')

const fs = require('node:fs/promises')

async function getCredentials() {
    try {
        const creds = await fs.readFile('config_credentials.json')
        return {
            clientId: creds.web.clientId,
            clientSecret: creds.web.clientSecret,
            redirectUrl: creds.web.redirectUrl[0],
        }
    } catch (err) {
        console.log('Failed to read file \'config_credentials.json\'')
        console.log(err)
        throw err
    }
}

async function init() {
    const creds = await getCredentials()

    const authClient = new OAuth2Client({
        clientId: creds.clientId,
        clientSecret: creds.clientSecret,
        redirectUri: creds.redirectUrl,
    })
    authClient.setCredentials({
        refresh_token: ''
    })

    authClient.on('tokens', (tokens) => {
        tokens.id_token
    })

    new GoogleApis({authClient: authClient }).youtube()

    google.options({ auth: authClient })
}



