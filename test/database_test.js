const assert = require('assert')
const { Storage, Users, Channels } = require('../src/database.js')
const Database = require('better-sqlite3')


describe('Users', () => {
    it('creates user by id', () => {
        const db = new Database(':memory:')
        try {
            db.exec(`
                CREATE TABLE IF NOT EXISTS teleUsers(
                    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                    telegramId INTEGER NOT NULL UNIQUE
                );

                INSERT INTO teleUsers(id, telegramId) VALUES(1, 22);
            `)
            const users = new Users(db)
            const result = users.getOrCreateWith(23)
            assert.deepEqual(result, { id: 2, telegramId: 23 })
            const storedUser = users.findUserByTelegramId(23)
            assert.deepEqual(storedUser, { id: 2, telegramId: 23 })
        } finally {
            db.close()
        }
    })
    it('do not create user with existing id', () => {
        const db = new Database(':memory:')
        try {
            db.exec(`
                CREATE TABLE IF NOT EXISTS teleUsers(
                    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                    telegramId INTEGER NOT NULL UNIQUE
                );

                INSERT INTO teleUsers(id, telegramId) VALUES(1, 22);
            `)
            const users = new Users(db)
            const result = users.getOrCreateWith(22)
            assert.deepEqual(result, { id: 1, telegramId: 22 })
            assert.deepEqual(users.findUserByTelegramId(22), { id: 1, telegramId: 22 })
        } finally {
            db.close()
        }
    })

    const tests = [
        { name: 'int', arg: 22 },
        { name: 'float', arg: 22.0 },
        { name: 'string', arg: '22' },
    ]
    tests.forEach(({ name, arg }) => {
        it(`handles '${name}' type of id`, () => {
            const db = new Database(':memory:')
            try {
                db.exec(`
                CREATE TABLE IF NOT EXISTS teleUsers(
                    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                    telegramId INTEGER NOT NULL UNIQUE
                );
                `)
                const users = new Users(db)
                const result = users.getOrCreateWith(arg)
                assert.deepEqual(result, { id: 1, telegramId: 22 })
                assert.deepEqual(users.findUserByTelegramId(22), { id: 1, telegramId: 22 })
            } finally {
                db.close()
            }
        })
    });
})

describe('Channels', () => {
    describe('#addChannel', () => {
        it('adds channels to table', () => {
            const db = new Database(':memory:')
            try {
                db.exec(`
                    CREATE TABLE IF NOT EXISTS channels(
                        channel TEXT PRIMARY KEY
                    );
                    `)
                const channels = new Channels(db)
                channels.addChannel('my_favorite_channel')
                assert.deepEqual(channels.getAll(), ['my_favorite_channel'])
            } finally {
                db.close()
            }
        })
        it('don\'t add channel if it was already added', () => {
            const db = new Database(':memory:')
            try {
                db.exec(`
                    CREATE TABLE IF NOT EXISTS channels(
                        channel TEXT PRIMARY KEY
                    );
                    INSERT INTO channels(channel) VALUES('my_favorite_channel');
                    `)
                const channels = new Channels(db)
                channels.addChannel('my_favorite_channel')
                assert.deepEqual(channels.getAll(), ['my_favorite_channel'])
            } finally {
                db.close()
            }
        })
    })
    describe('#bindChannel', () => {
        it('user should have id', () => {
            const db = new Database(':memory:')
            try {
                db.exec(`
                    CREATE TABLE IF NOT EXISTS channels(
                        channel TEXT PRIMARY KEY
                    );
                    CREATE TABLE IF NOT EXISTS teleUserToYoutubeChannel(
                        teleUserId INTEGER NOT NULL,
                        youtubeChannelId TEXT NOT NULL
                    );
                    `)
                const channels = new Channels(db)
                assert.doesNotThrow(() => {
                    channels.bindChannel('vasiya')
                    channels.bindChannel('vasiya', {})
                })
            } finally {
                db.close()
            }
        })
        it('binds channel to specified user', () => {
            const db = new Database(':memory:')
            try {
                db.exec(`
                    CREATE TABLE IF NOT EXISTS channels(
                        channel TEXT PRIMARY KEY
                    );
                    CREATE TABLE IF NOT EXISTS teleUserToYoutubeChannel(
                        teleUserId INTEGER NOT NULL,
                        youtubeChannelId TEXT NOT NULL
                    );
                    `)
                const channels = new Channels(db)
                channels.addChannel('tbd')
                channels.bindChannel('tbd', { id: 1 })
                assert.deepEqual(channels.getChannelsForUser({ id: 1 }), ['tbd'])
            } finally {
                db.close()
            }
        })
    })
    describe('#getAll', () => {
        it('returns all stored channels', () => {
            const db = new Database(':memory:')
            try {
                db.exec(`
                    CREATE TABLE IF NOT EXISTS channels(
                        channel TEXT PRIMARY KEY
                    );
                    CREATE TABLE IF NOT EXISTS teleUserToYoutubeChannel(
                        teleUserId INTEGER NOT NULL,
                        youtubeChannelId TEXT NOT NULL
                    );

                    INSERT INTO channels(channel) VALUES('vse_kak_u_zverey'), 
                        ('kkkotlin'), ('top_js'), ('french_fore_everyone');
                    `)
                const channels = new Channels(db)

                assert.deepEqual(
                    channels.getAll(),
                    ['vse_kak_u_zverey', 'kkkotlin', 'top_js', 'french_fore_everyone'],
                )
            } finally {
                db.close()
            }
        })
    })
    describe('#getChannels', () => {
        it('returns empty array when no channels found for specified user', () => {
            const db = new Database(':memory:')
            try {
                db.exec(`
                    CREATE TABLE IF NOT EXISTS channels(
                        channel TEXT PRIMARY KEY
                    );
                    CREATE TABLE IF NOT EXISTS teleUserToYoutubeChannel(
                        teleUserId INTEGER NOT NULL,
                        youtubeChannelId TEXT NOT NULL
                    );

                    INSERT INTO channels(channel) VALUES('vse_kak_u_zverey'), 
                        ('kkkotlin'), ('top_js'), ('french_fore_everyone');
                    
                    INSERT INTO teleUserToYoutubeChannel(teleUserId, youtubeChannelId) VALUES 
                        (1, 'vse_kak_u_zverey'),
                        (2, 'kkkotlin'), 
                        (3, 'top_js'), 
                        (3, 'french_fore_everyone');
                    `)

                const channels = new Channels(db)

                assert.deepEqual(
                    channels.getChannelsForUser({ id: 10 }),
                    [],
                )
            } finally {
                db.close()
            }
        })

        it('returns empty array when no channels found for specified user', () => {
            const db = new Database(':memory:')
            try {
                db.exec(`
                    CREATE TABLE IF NOT EXISTS channels(
                        channel TEXT PRIMARY KEY
                    );
                    CREATE TABLE IF NOT EXISTS teleUserToYoutubeChannel(
                        teleUserId INTEGER NOT NULL,
                        youtubeChannelId TEXT NOT NULL
                    );

                    INSERT INTO channels(channel) VALUES('vse_kak_u_zverey'), 
                        ('kkkotlin'), ('top_js'), ('french_fore_everyone');
                    
                    INSERT INTO teleUserToYoutubeChannel(teleUserId, youtubeChannelId) VALUES 
                        (1, 'vse_kak_u_zverey'),
                        (2, 'kkkotlin'), 
                        (3, 'top_js'), 
                        (3, 'french_fore_everyone');
                    `)

                const channels = new Channels(db)

                assert.deepEqual(
                    channels.getChannelsForUser({ id: 3 }),
                    ['top_js', 'french_fore_everyone'],
                )
            } finally {
                db.close()
            }
        })
    })
})