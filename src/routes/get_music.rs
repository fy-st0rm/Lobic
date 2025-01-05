use crate::app_state::AppState;
use crate::lobic_db::models::Music;

use axum::{
	body::Body,
	extract::{Path, Query, State},
	http::{
		header::{self},
		StatusCode,
	},
	response::{IntoResponse, Response},
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
pub struct MusicQuery {
	title: Option<String>,
	uuid: Option<String>,
}

pub async fn get_music(
	State(app_state): State<AppState>,
	Query(params): Query<MusicQuery>,
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

	let mut query = music.into_boxed();

	// Build query based on provided parameters
	match (params.title, params.uuid) {
		(Some(title_val), None) => {
			query = query.filter(title.eq(title_val));
		}
		(None, Some(uuid_val)) => {
			query = query.filter(music_id.eq(uuid_val));
		}
		(None, None) => {
			// No parameters - return all music
		}
		(Some(_), Some(_)) => {
			return Response::builder()
				.status(StatusCode::BAD_REQUEST)
				.body("Please provide either title or uuid, not both".to_string())
				.unwrap();
		}
	}

	let result = query.load::<Music>(&mut db_conn);

	match result {
		Ok(music_entries) => {
			if music_entries.is_empty() {
				return Response::builder()
					.status(StatusCode::NOT_FOUND)
					.body("No music entries found".to_string())
					.unwrap();
			}

			let responses: Vec<MusicResponse> = music_entries
				.into_iter()
				.map(|entry| {
					let cover_art_path = format!("./cover_images/{}.png", entry.music_id);
					let has_cover = fs::metadata(&cover_art_path).is_ok();

					MusicResponse {
						id: entry.music_id,
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
			.body("No music entries found".to_string())
			.unwrap(),
		Err(err) => Response::builder()
			.status(StatusCode::INTERNAL_SERVER_ERROR)
			.body(format!("Database error: {err}"))
			.unwrap(),
	}
}

pub async fn get_cover_image(Path(filename): Path<String>) -> impl IntoResponse {
	// Construct the path to the cover image
	let mut path = PathBuf::from("cover_images");
	path.push(&filename);

	// Open the file
	let mut file = match File::open(&path).await {
		Ok(file) => file,
		Err(_) => {
			return (StatusCode::NOT_FOUND, "Image not found").into_response();
		}
	};

	// Read the file into a byte vector
	let mut file_bytes = Vec::new();
	if let Err(_) = file.read_to_end(&mut file_bytes).await {
		return (
			StatusCode::INTERNAL_SERVER_ERROR,
			"Failed to read image file",
		)
			.into_response();
	}

	// Determine the MIME type based on the file extension
	let mime_type = match path.extension().and_then(|ext| ext.to_str()) {
		Some("jpg") | Some("jpeg") => "image/jpeg",
		Some("png") => "image/png",
		Some("gif") => "image/gif",
		Some("webp") => "image/webp",
		_ => "application/octet-stream", // Fallback MIME type
	};

	// Serve the file as a response using Body
	Response::builder()
		.status(StatusCode::OK)
		.header(header::CONTENT_TYPE, mime_type)
		.body(Body::from(file_bytes)) // Use Body::from to create the response body
		.unwrap()
}

pub async fn send_music(
	State(app_state): State<AppState>,
	Path(music_path): Path<String>, // Extract `path` from the URL path
) -> impl IntoResponse {
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
