use crate::app_state::AppState;
use crate::lobic_db::models::Music;
use axum::{
	extract::{Query, State},
	http::{header, StatusCode},
	response::Response,
};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use std::{cmp::Ordering, fs};
use strsim::jaro_winkler; // Fuzzy string matching

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
pub struct SearchQuery {
	search_string: String,
	no_results_to_gen: Option<usize>,
}

pub async fn search_music(
	State(app_state): State<AppState>,
	Query(params): Query<SearchQuery>,
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

	// Fetch all music entries from the database
	let all_music = match music.load::<Music>(&mut db_conn) {
		Ok(entries) => entries,
		Err(err) => {
			return Response::builder()
				.status(StatusCode::INTERNAL_SERVER_ERROR)
				.body(format!("Database error: {err}"))
				.unwrap();
		}
	};

	// Perform fuzzy search on all fields with weighted scores
	let search_results = all_music
		.into_iter()
		.map(|entry| {
			// Check for exact matches in title, artist, or album
			let exact_match = entry.title.eq_ignore_ascii_case(&params.search_string)
				|| entry.artist.eq_ignore_ascii_case(&params.search_string)
				|| entry.album.eq_ignore_ascii_case(&params.search_string);

			// Calculate similarity scores for each field
			let title_score = jaro_winkler(&entry.title, &params.search_string);
			let artist_score = jaro_winkler(&entry.artist, &params.search_string);
			let album_score = jaro_winkler(&entry.album, &params.search_string);
			let genre_score = jaro_winkler(&entry.genre, &params.search_string);

			// Assign weights to each field based on priority
			let weighted_score = if exact_match {
				// Assign a very high score for exact matches
				1000.0
			} else {
				// Use weighted scores for non-exact matches
				(title_score * 10.0) // Title has the highest weight
                    + (artist_score * 8.0) // Artist has the second highest weight
                    + (album_score * 8.0) // Album has the third highest weight
                    + (genre_score * 1.0) // Genre has the lowest weight
			};

			(entry, weighted_score)
		})
		.filter(|(_, score)| *score > 2.0) // Filter out low similarity results
		.collect::<Vec<_>>();

	// Sort results by weighted score (descending order)
	let mut sorted_results = search_results;
	sorted_results.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(Ordering::Equal));

	// Limit the number of results
	let no_results = params.no_results_to_gen.unwrap_or(10);
	let top_results = sorted_results
		.into_iter()
		.take(no_results)
		.map(|(entry, _)| {
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
		.collect::<Vec<_>>();

	// Return the results as JSON
	match serde_json::to_string(&top_results) {
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
