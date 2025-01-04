use crate::app_state::AppState;
use crate::lobic_db::models::Music;

use axum::{
	body::Body,
	extract::{Path, Query, State},
	http::{
		header::{self, CONTENT_DISPOSITION, CONTENT_TYPE},
		StatusCode,
	},
	response::{IntoResponse, Response},
	Json,
};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tokio::{fs::File, io::AsyncReadExt};
use tokio_util::io::ReaderStream;

use super::save_music::MusicPath;

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
	State(app_state): State<AppState>,
	Json(payload): Json<MusicRequest>,
) -> Response<String> {
	let mut db_conn = match app_state.db_pool.get() {
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
pub async fn get_all_music(State(app_state): State<AppState>) -> Response<String> {
	let mut db_conn = match app_state.db_pool.get() {
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

#[derive(Deserialize)]
pub struct UuidRequest {
	uuid: String,
}
pub async fn get_music_by_uuid(
	State(app_state): State<AppState>,
	Json(payload): Json<UuidRequest>,
) -> Response<String> {
	let mut db_conn = match app_state.db_pool.get() {
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

	let result = music
		.filter(id.eq(&payload.uuid))
		.load::<Music>(&mut db_conn);

	match result {
		Ok(music_entries) => {
			if music_entries.is_empty() {
				return Response::builder()
					.status(StatusCode::NOT_FOUND)
					.body("No music entry found with the given UUID".to_string())
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
						cover_art_path: has_cover.then_some(cover_art_path),
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
			.body("No music entry found with the given UUID".to_string())
			.unwrap(),
		Err(err) => Response::builder()
			.status(StatusCode::INTERNAL_SERVER_ERROR)
			.body(format!("Database error: {err}"))
			.unwrap(),
	}
}

pub async fn get_cover_image(Path(filename): Path<String>) -> Response {
	let mut path = PathBuf::from("cover_images");
	path.push(filename);

	match File::open(&path).await {
		Ok(file) => {
			let stream = ReaderStream::new(file);
			let body = Body::from_stream(stream);

			let mime_type = match path.extension().and_then(|ext| ext.to_str()) {
				Some("jpg") | Some("jpeg") => "image/jpeg",
				Some("png") => "image/png",
				Some("gif") => "image/gif",
				Some("webp") => "image/webp",
				_ => "application/octet-stream",
			};

			Response::builder()
				.status(StatusCode::OK)
				.header(header::CONTENT_TYPE, mime_type)
				.body(body)
				.unwrap()
		}
		Err(_) => Response::builder()
			.status(StatusCode::NOT_FOUND)
			.header(header::CONTENT_TYPE, "text/plain")
			.body(Body::from("Image not found"))
			.unwrap(),
	}
}

pub async fn send_music(
	State(app_state): State<AppState>,
	Query(payload): Query<MusicPath>,
) -> impl IntoResponse {
	let music_path = payload.path;

	// Open the file
	let mut file = match File::open(&music_path).await {
		Ok(file) => file,
		Err(_) => return (axum::http::StatusCode::NOT_FOUND, "File not found").into_response(),
	};

	// Read the file into a byte vector
	let mut file_bytes = Vec::new();
	if let Err(_) = file.read_to_end(&mut file_bytes).await {
		return (
			axum::http::StatusCode::INTERNAL_SERVER_ERROR,
			"Failed to read file",
		)
			.into_response();
	}

	// Serve the file as a response
	Response::builder()
		.header("Content-Type", "audio/mpeg")
		.header("Content-Disposition", "attachment; filename=\"music.mp3\"")
		.body(file_bytes.into())
		.unwrap()
}
