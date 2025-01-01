// [ ] TODO : the remove redundancy while storing images and the music

use crate::lobic_db::db::DatabasePool;
use crate::lobic_db::models::Music;
use crate::schema::music::dsl::*;
use axum::{
	http::{header, status::StatusCode},
	response::Response,
	Json,
};
use diesel::prelude::*;
use id3::{frame::PictureType, Frame, Tag, TagLike};
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Write;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct MusicPath {
	pub path: String, //     "path" : "/home/rain/Lobic/music/Sunsetz.mp3"
}
pub async fn save_music(Json(payload): Json<MusicPath>, db_pool: DatabasePool) -> Response<String> {
	// Getting db from pool
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

	let path = payload.path;
	let tag = Tag::read_from_path(&path).unwrap_or_default();
	let curr_music_id = Uuid::new_v4();
	let curr_music = Music {
		id: curr_music_id.to_string(),
		filename: path.to_string(),
		artist: tag.artist().unwrap_or("Unknown Artist").to_string(),
		title: tag.title().unwrap_or("Unknown Title").to_string(),
		album: tag.album().unwrap_or("Unknown Album").to_string(),
		genre: tag.genre().unwrap_or("Unknown Genre").to_string(),
	};
	print!("bazz");
	match extract_cover_art(path.as_str(), &curr_music_id) {
		Ok(_) => println!("Successfully extracted cover art"),
		Err(e) => println!("Failed to extract cover art: {}", e),
	}

	// Insert the new music entry
	diesel::insert_into(music)
		.values(&curr_music)
		.execute(&mut db_conn)
		.unwrap();

	// Return a successful response
	Response::builder()
		.status(StatusCode::OK)
		.body("Music entry saved successfully".to_string())
		.unwrap()
}

fn extract_cover_art(mp3_path: &str, uuid: &Uuid) -> Result<(), Box<dyn std::error::Error>> {
	println!("Starting cover art extraction for: {}", mp3_path);

	let tag = Tag::read_from_path(mp3_path)?;
	println!("Successfully read ID3 tag");

	// Collect all pictures into a Vec to avoid lifetime issues
	let pictures: Vec<_> = tag.pictures().collect();
	println!("Found {} pictures in tag", pictures.len());

	// Look for the cover art in the collected pictures
	if let Some(picture) = pictures
		.iter()
		.find(|pic| pic.picture_type == PictureType::CoverFront)
	{
		// Create the cover_images directory if it doesn't exist
		fs::create_dir_all("./cover_images")?;
		println!("Created/verified cover_images directory");

		let output_path = format!("./cover_images/{}.png", uuid);

		let mut file = fs::File::create(&output_path)?;
		file.write_all(&picture.data)?;
		println!("Successfully wrote cover art to: {}", output_path);

		Ok(())
	} else {
		println!("No front cover picture found in tag");
		Err("No cover art found in the MP3 file".into())
	}
}
