// models.rs
use crate::schema::{music, playlist_shares, playlist_songs, playlists, users};
use diesel::{prelude::Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};

#[derive(Insertable, Queryable, Debug)]
#[diesel(table_name = users)]
pub struct User {
	pub user_id: String,
	pub username: String,
	pub email: String,
	pub pwd_hash: String,
}

#[derive(Insertable, Queryable, Debug, Selectable, Serialize, Deserialize)]
#[diesel(table_name = music)]
pub struct Music {
	pub music_id: String,
	pub filename: String,
	pub artist: String,
	pub title: String,
	pub album: String,
	pub genre: String,
}

#[derive(Insertable, Queryable, Debug)]
#[diesel(table_name = playlists)]
pub struct Playlist {
	pub playlist_id: String,
	pub playlist_name: String,
	pub user_id: String,
	pub description: Option<String>,
	pub creation_date_time: String,
	pub last_updated_date_time: String,
}

#[derive(Insertable, Queryable, Debug)]
#[diesel(table_name = playlist_songs)]
pub struct PlaylistSong {
	pub playlist_id: String,
	pub music_id: String,
	pub position: i32,
	pub song_added_date_time: String,
}

#[derive(Insertable, Queryable, Debug)]
#[diesel(table_name = playlist_shares)]
pub struct PlaylistShare {
	pub playlist_id: String,
	pub owner_user_id: String,
	pub shared_to_user_id: String,
	pub share_permission: String,
}
