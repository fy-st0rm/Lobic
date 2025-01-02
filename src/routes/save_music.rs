// [ ] TODO : the remove redundancy while storing images and the music

use crate::lobic_db::db::DatabasePool;
use crate::lobic_db::models::Music;
use crate::schema::music::dsl::*;
use axum::{http::status::StatusCode, response::Response, Json};
use diesel::prelude::*;
use id3::{frame::PictureType, Tag, TagLike};
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Write;
use std::path::Path;
use uuid::Uuid;
use walkdir::WalkDir;

#[derive(Debug, Serialize, Deserialize)]
pub struct MusicPath {
	pub path: String, //     "path" : "/home/rain/Lobic/music/Sunsetz.mp3"
}
pub async fn save_music(Json(payload): Json<MusicPath>, db_pool: DatabasePool) -> Response<String> {
	let path = Path::new(&payload.path);
	let mut saved_count = 0;
	let mut errors = Vec::new();
	let mut db_conn = match db_pool.get() {
		Ok(conn) => conn,
		Err(err) => {
			return Response::builder()
				.status(StatusCode::INTERNAL_SERVER_ERROR)
				.body(format!("Failed to get DB from pool: {err}"))
				.unwrap();
		}
	};

	if path.is_dir() {
		for entry in WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
			if is_music_file(entry.path()) {
				match process_music_file(entry.path(), &mut db_conn) {
					Ok(_) => saved_count += 1,
					Err(e) => errors.push(format!("{}: {}", entry.path().display(), e)),
				}
			}
		}
	} else if is_music_file(path) {
		match process_music_file(path, &mut db_conn) {
			Ok(_) => saved_count += 1,
			Err(e) => errors.push(format!("{}: {}", path.display(), e)),
		}
	}

	let status = if errors.is_empty() {
		StatusCode::OK
	} else {
		StatusCode::PARTIAL_CONTENT
	};

	Response::builder()
		.status(status)
		.body(format!(
			"Processed {} files. {}",
			saved_count,
			if !errors.is_empty() {
				format!("\nErrors: {}", errors.join("\n"))
			} else {
				String::new()
			}
		))
		.unwrap()
}

fn is_music_file(path: &Path) -> bool {
	match path.extension() {
		Some(ext) => matches!(
			ext.to_str().unwrap_or("").to_lowercase().as_str(),
			"mp3" | "m4a" | "flac" | "wav" | "ogg"
		),
		None => false,
	}
}

fn process_music_file(
	path: &Path,
	db_conn: &mut SqliteConnection,
) -> Result<(), Box<dyn std::error::Error>> {
	let path_str = path.to_str().ok_or("Invalid path")?;
	let tag = Tag::read_from_path(path_str).unwrap_or_default();
	let curr_music_id = Uuid::new_v4();

	let curr_music = Music {
		id: curr_music_id.to_string(),
		filename: path_str.to_string(),
		artist: tag.artist().unwrap_or("Unknown Artist").to_string(),
		title: tag.title().unwrap_or("Unknown Title").to_string(),
		album: tag.album().unwrap_or("Unknown Album").to_string(),
		genre: tag.genre().unwrap_or("Unknown Genre").to_string(),
	};

	extract_cover_art(path_str, &curr_music_id)?;

	diesel::insert_into(music)
		.values(&curr_music)
		.execute(db_conn)?;

	Ok(())
}

fn extract_cover_art(mp3_path: &str, uuid: &Uuid) -> Result<(), Box<dyn std::error::Error>> {
	let tag = Tag::read_from_path(mp3_path)?;

	// Collect all pictures into a Vec to avoid lifetime issues
	let pictures: Vec<_> = tag.pictures().collect();

	// Look for the cover art in the collected pictures
	if let Some(picture) = pictures
		.iter()
		.find(|pic| pic.picture_type == PictureType::CoverFront)
	{
		// Create the cover_images directory if it doesn't exist
		fs::create_dir_all("./cover_images")?;

		let output_path = format!("./cover_images/{}.png", uuid);

		let mut file = fs::File::create(&output_path)?;
		file.write_all(&picture.data)?;

		Ok(())
	} else {
		Err("No cover art found in the MP3 file".into())
	}
}
