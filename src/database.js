const Database = require("better-sqlite3");
const fs = require("fs");

function createDatabase(file, isLoggingEnabled) {
    const options = isLoggingEnabled ? { verbose: console.log } : {};
    const db = new Database(file, options);

    db.userVersion = () => {
        return db.pragma("user_version")[0].user_version;
    }

    if (isLoggingEnabled) console.log("Read and list available migrations...");
    const migrations = {};

    for (const migration of fs.readdirSync("migrations")) {
        const version = parseInt(migration.split("_").at(0));
        if (isLoggingEnabled) console.log(`migration ${version} => ${migration}`);
        migrations[version] = migration;
    }

    db.transaction(() => {
        const dbVersion = db.userVersion();
        for (const [version, migration] of Object.entries(migrations)) {
            if (version < dbVersion) {
                if (isLoggingEnabled) console.log(`Migration with version ${version} was applied already. Will be skipped.`);
                continue;
            };

            const script = fs.readFileSync(`migrations/${migration}`, { encoding: "utf-8" });
            try {
                db.exec(script);
            } catch (err) {
                throw new Error(`Failed to execute migration ${migration}. Cause: ${err.message}`);
            }
            if (isLoggingEnabled) console.log(`Migration ${migration} is applied successfully`);
        }
    })();

    if (isLoggingEnabled) console.log(`Database migration is finished. Database version is ${db.userVersion()}`);

    if (isLoggingEnabled) console.log("Current database schema: ");

    if (isLoggingEnabled) db.prepare("SELECT sql FROM sqlite_schema WHERE sql IS NOT NULL").all().forEach((row) => console.log(row.sql));

    return db
}

class Users {
    constructor(db) {
        this.db = db
    }

    getOrCreateWith(telegramId) {
        const user = this.findUserByTelegramId(telegramId)
        if (user) {
            return user
        }
        const insert = this.db.prepare("INSERT INTO teleUsers(telegramId) VALUES(@telegramId);");
        insert.run({ telegramId: telegramId });
        return this.findUserByTelegramId(telegramId)
    }

    findUserByTelegramId(telegramId) {
        const targetId = Number(telegramId)
        return this.db.prepare("SELECT id, telegramId FROM teleUsers WHERE telegramId = @telegramId")
            .get({ telegramId: targetId })
    }
};
module.exports.Users = Users

class Channels {
    constructor(db, users) {
        this.db = db
        this.users = users
    }
    
    addChannel(channel) {
        this.db.prepare(`INSERT OR IGNORE INTO channels(channel) VALUES (@channel)`)
            .run({ channel: channel })
    }

    bindChannel(channel, user) {
        if (user && 'id' in user) {
            this.db.prepare('INSERT OR IGNORE INTO teleUserToYoutubeChannel(teleUserId, youtubeChannelId) VALUES(@userId, @channel)')
                .run({ userId: user.id, channel: channel })
        }
    }

    getChannelsForUser(user) {
        if (user && 'id' in user) {
            return this.db.prepare(`
            SELECT channel FROM teleUserToYoutubeChannel userToChannel 
                INNER JOIN channels
                ON userToChannel.teleUserId = @userId 
                    AND userToChannel.youtubeChannelId = channels.channel
            `).all({ userId: user.id }).map((row) => row.channel)
        } else {
            return []
        }
    }

    getAll() {
        return this.db.prepare(`SELECT channel FROM channels`).all().map((row) => row.channel)
    }
}
module.exports.Channels = Channels;

module.exports.Storage = class Storage {

    #db
    #users
    #channels

    constructor(db) {
        this.#db = db
        this.#users = new Users(db)
        this.#channels = new Channels(db, this.users)
    }

    static memory(isLoggingEnabled) {
        return new Storage(createDatabase(':memory:', isLoggingEnabled || false))
    }

    static file(file, isLoggingEnabled) {
        return new Storage(createDatabase(file, isLoggingEnabled || false))
    }

    get users() {
        return this.#users
    }

    get channels() {
        return this.#channels
    }

    close() {
        this.#db.close()
    }
}

