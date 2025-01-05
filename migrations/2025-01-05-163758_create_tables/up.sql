-- up.sql
CREATE TABLE users (
    user_id TEXT PRIMARY KEY NOT NULL,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    pwd_hash TEXT NOT NULL
);

CREATE TABLE music (
    music_id TEXT PRIMARY KEY NOT NULL,
    filename TEXT NOT NULL,
    artist TEXT NOT NULL,
    title TEXT NOT NULL,
    album TEXT NOT NULL,
    genre TEXT NOT NULL
);

CREATE TABLE playlists (
    playlist_id TEXT PRIMARY KEY NOT NULL,
    playlist_name TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(user_id),
    description TEXT,
    creation_date_time TEXT NOT NULL,
    last_updated_date_time TEXT NOT NULL
);

CREATE TABLE playlist_songs (
    playlist_id TEXT NOT NULL REFERENCES playlists(playlist_id),
    music_id TEXT NOT NULL REFERENCES music(music_id),
    position INTEGER NOT NULL,
    song_added_date_time TEXT NOT NULL,
    PRIMARY KEY (playlist_id, music_id)
);

CREATE TABLE playlist_shares (
    playlist_id TEXT NOT NULL REFERENCES playlists(playlist_id),
    owner_user_id TEXT NOT NULL REFERENCES users(user_id),
    shared_to_user_id TEXT NOT NULL REFERENCES users(user_id),
    share_permission TEXT NOT NULL,
    PRIMARY KEY (playlist_id, shared_to_user_id)
);