--
--
-- Database schema updates should be made by sql(ite) scripts
-- Each file should have prefix XX; XX is for db version on which migration is applied
-- Each file should set database version at the end of the file via PRAGMA user_version 
--
--

CREATE TABLE IF NOT EXISTS teleUsers(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    telegramId INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS channels(
    youtubeId TEXT PRIMARY KEY,
    title TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS teleUserToYoutubeChannel(
    teleUserId INTEGER NOT NULL,
    youtubeChannelId TEXT NOT NULL
);

PRAGMA user_version = 1;