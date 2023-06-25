const Database = require('better-sqlite3')
const assert = require('assert')

describe('better-sqlite3', () => {
    describe('#insert', () => {
        it('fails if record already exists', () => {
            const db = new Database(':memory:')
            db.exec(`
                CREATE TABLE Test(
                    id INTEGER PRIMARY KEY
                );

                INSERT INTO Test(id) VALUES(1);
            `)
            assert.throws(
                () => db.prepare('insert into test(id) values(@id)').run({ id: 1 }),
                { name: 'SqliteError' }
            )
        })
        it('ignore collisions when IGNORE option specified', () => {
            const db = new Database(':memory:')
            db.exec(`
                CREATE TABLE Test(
                    id INTEGER PRIMARY KEY
                );

                INSERT INTO Test(id) VALUES(1);
            `)
            assert.doesNotThrow(
                () => db.prepare('insert or ignore into test(id) values(@id)').run({ id: 1 }),
                { name: 'SqliteError' }
            )
        })
        it('select two columns as object from table', () => {
            const db = new Database(':memory:')
            db.exec(`
                CREATE TABLE test(
                    id INTEGER PRIMARY KEY,
                    name TEXT UNIQUE NOT NULL
                );

                INSERT INTO test(id, name) VALUES(1, 'Vasiliy');
            `)
            const queryResult = db.prepare('SELECT id, name FROM test WHERE id = @id').get({ id: 1 })
            assert.deepEqual(queryResult, { id: 1, name: 'Vasiliy' })
        })
    })
})