CREATE TABLE music (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT NOT NULL,
    file_path TEXT NOT NULL,
    duration INTEGER NOT NULL
);
