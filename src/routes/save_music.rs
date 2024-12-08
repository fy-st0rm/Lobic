use crate::lobic_db::models::NewMusic;
use crate::lobic_db::db::DatabasePool;
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
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct MusicPayload {
    pub title: String,
    pub artist: String,
    pub album: String,
    pub file_path: String,
    pub duration: i32,
}

pub async fn save_music(
    Json(payload): Json<MusicPayload>,
    db_pool: DatabasePool,
) -> Result<Response<String>, StatusCode> {
    // Get a database connection from the pool
    let mut db_conn = db_pool.get().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let new_music = NewMusic {
        title: &payload.title,
        artist: &payload.artist,
        album: &payload.album,
        file_path: &payload.file_path,
        duration: payload.duration,
    };

    // Insert the new music entry
    diesel::insert_into(music)
        .values(&new_music)
        .execute(&mut db_conn)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Return a successful response
    Ok(Response::builder()
        .status(StatusCode::OK)
        .body("Music entry saved successfully".to_string())
        .unwrap())
}