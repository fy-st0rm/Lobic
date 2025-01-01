use crate::lobic_db::db::DatabasePool;
use crate::lobic_db::models::Music;
use crate::schema::music::dsl::*;
use axum::{
	http::{header, status::StatusCode},
	response::Response,
	Json,
};
use diesel::prelude::*;

use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Debug, Serialize, Deserialize)]
pub struct MusicResponse {
	pub id: String,
	pub filename: String,
	pub artist: String,
	pub title: String,
	pub album: String,
	pub genre: String,
	pub cover_art_path: Option<String>,
}

#[derive(Deserialize)]
pub struct MusicRequest {
	pub title: String, //"title" : "K."
}

pub async fn get_music_by_title(
	Json(payload): Json<MusicRequest>,
	db_pool: DatabasePool,
) -> Response<String> {
	let mut db_conn = match db_pool.get() {
		Ok(conn) => conn,
		Err(err) => {
			let msg = format!("Failed to get DB from pool: {err}");
			return Response::builder()
				.status(StatusCode::INTERNAL_SERVER_ERROR)
				.body(msg)
				.unwrap();
		}
	};

	use crate::schema::music::dsl::*;

	// Fetch all music entries that match the title
	let result = music
		.filter(title.eq(&payload.title))
		.load::<Music>(&mut db_conn);

	match result {
		Ok(music_entries) => {
			if music_entries.is_empty() {
				return Response::builder()
					.status(StatusCode::NOT_FOUND)
					.body("No music entries found with the given title".to_string())
					.unwrap();
			}

			// Map through the music entries to create responses
			let responses: Vec<MusicResponse> = music_entries
				.into_iter()
				.map(|music_entry| {
					let cover_art_path = format!("./cover_images/{}.png", music_entry.id);
					let has_cover = fs::metadata(&cover_art_path).is_ok();

					MusicResponse {
						id: music_entry.id,
						filename: music_entry.filename,
						artist: music_entry.artist,
						title: music_entry.title,
						album: music_entry.album,
						genre: music_entry.genre,
						cover_art_path: if has_cover {
							Some(cover_art_path)
						} else {
							None
						},
					}
				})
				.collect();

			match serde_json::to_string(&responses) {
				Ok(json) => Response::builder()
					.status(StatusCode::OK)
					.header(header::CONTENT_TYPE, "application/json")
					.body(json)
					.unwrap(),
				Err(err) => Response::builder()
					.status(StatusCode::INTERNAL_SERVER_ERROR)
					.body(format!("Failed to serialize response: {err}"))
					.unwrap(),
			}
		}
		Err(diesel::NotFound) => Response::builder()
			.status(StatusCode::NOT_FOUND)
			.body("No music entries found with the given title".to_string())
			.unwrap(),
		Err(err) => Response::builder()
			.status(StatusCode::INTERNAL_SERVER_ERROR)
			.body(format!("Database error: {err}"))
			.unwrap(),
	}
}
// Get all music entries
pub async fn get_all_music(db_pool: DatabasePool) -> Response<String> {
	let mut db_conn = match db_pool.get() {
		Ok(conn) => conn,
		Err(err) => {
			let msg = format!("Failed to get DB from pool: {err}");
			return Response::builder()
				.status(StatusCode::INTERNAL_SERVER_ERROR)
				.body(msg)
				.unwrap();
		}
	};

	use crate::schema::music::dsl::*;

	let result = music.load::<Music>(&mut db_conn);

	match result {
		Ok(music_entries) => {
			if music_entries.is_empty() {
				println!("No music entries found");
				return Response::builder()
					.status(StatusCode::OK)
					.header(header::CONTENT_TYPE, "application/json")
					.body("There is no music in the db ".to_string())
					.unwrap();
			}

			let responses: Vec<MusicResponse> = music_entries
				.into_iter()
				.map(|entry| {
					let cover_art_path = format!("./cover_images/{}.png", entry.id);
					let has_cover = fs::metadata(&cover_art_path).is_ok();

					MusicResponse {
						id: entry.id,
						filename: entry.filename,
						artist: entry.artist,
						title: entry.title,
						album: entry.album,
						genre: entry.genre,
						cover_art_path: if has_cover {
							Some(cover_art_path)
						} else {
							None
						},
					}
				})
				.collect();
			match serde_json::to_string(&responses) {
				Ok(json) => Response::builder()
					.status(StatusCode::OK)
					.header(header::CONTENT_TYPE, "application/json")
					.body(json)
					.unwrap(),
				Err(err) => Response::builder()
					.status(StatusCode::INTERNAL_SERVER_ERROR)
					.body(format!("Failed to serialize response: {err}"))
					.unwrap(),
			}
		}
		Err(err) => Response::builder()
			.status(StatusCode::INTERNAL_SERVER_ERROR)
			.body(format!("Database error: {err}"))
			.unwrap(),
	}
}
