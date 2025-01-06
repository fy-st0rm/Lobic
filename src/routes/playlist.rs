use crate::app_state::AppState;
use crate::schema::playlists::dsl::*;
use axum::{extract::State, http::status::StatusCode, response::Response, Json};
use chrono::Utc;
use diesel::prelude::*;

use crate::lobic_db::models::Playlist;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct NewPlaylist {
	pub playlist_name: String,
	pub user_id: String,
	pub description: Option<String>,
}

pub async fn create_playlist(State(app_state): State<AppState>, Json(payload): Json<NewPlaylist>) -> Response<String> {
	let mut db_conn = match app_state.db_pool.get() {
		Ok(conn) => conn,
		Err(err) => {
			return Response::builder()
				.status(StatusCode::INTERNAL_SERVER_ERROR)
				.body(format!("Failed to get DB from pool: {err}"))
				.unwrap();
		}
	};

	let curr_playlist_id = Uuid::new_v4().to_string();
	let curr_creation_date_time = Utc::now().to_rfc3339();

	let new_playlist = Playlist {
		playlist_id: curr_playlist_id.clone(),
		playlist_name: payload.playlist_name,
		user_id: payload.user_id,
		description: payload.description,
		creation_date_time: curr_creation_date_time.clone(),
		last_updated_date_time: curr_creation_date_time,
	};

	match diesel::insert_into(playlists)
		.values(&new_playlist)
		.execute(&mut db_conn)
	{
		Ok(_) => Response::builder()
			.status(StatusCode::CREATED)
			.body(format!("Playlist created with ID: {}", new_playlist.playlist_id))
			.unwrap(),
		Err(err) => Response::builder()
			.status(StatusCode::INTERNAL_SERVER_ERROR)
			.body(format!("Failed to create playlist: {}", err))
			.unwrap(),
	}
}

/*
post : http://127.0.0.1:8080/playlist/new
{
	"playlist_name": "getting bored",
	"user_id": "80354d79-95cc-451d-a8f1-138b3f9027ea",
	"description": "mfff"
}
 */
