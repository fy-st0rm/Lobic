use crate::lobic_db::db::DatabasePool;
use crate::lobic_db::models::Music;
use crate::schema::music::dsl::*;
use diesel::prelude::*;
use axum::{
    Json,
    response::Response,
    http::{
        header,
        status::StatusCode,
    },
};
use id3::{Tag, TagLike};
use serde::{Deserialize, Serialize};
use uuid::Uuid;


#[derive(Debug, Serialize, Deserialize)]
pub struct MusicPath{
    pub path : String,
}

pub async fn save_music(
    Json(payload): Json<MusicPath>,
    db_pool: DatabasePool,
) -> Response<String> {
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

    let _music = Music {
        id : Uuid::new_v4().to_string(),
        filename: path.to_string(),
        artist: tag.artist().unwrap_or("Unknown Artist").to_string(),
        title: tag.title().unwrap_or("Unknown Title").to_string(),
        album: tag.album().unwrap_or("Unknown Album").to_string(),
        genre: tag.genre().unwrap_or("Unknown Genre").to_string(),
    };

    // Insert the new music entry
    diesel::insert_into(music)
        .values(&_music)
        .execute(&mut db_conn)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR);

    // Return a successful response
    Response::builder()
        .status(StatusCode::OK)
        .body("Music entry saved successfully".to_string())
        .unwrap()
}