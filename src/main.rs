/*
 * TODO:
 * [ ] Implement Leave and Delete lobby
 * [ ] Implement auto deletion when host disconnects
 * [ ] Implement AppState functionality to routes
 * [ ] Implement verify route as middleware (if needed)
 */

// TODO:
// When joining the ws send JOIN OpCode with user_id
// Store the { user_id: broadcast } in hashmap
// Change the lobby client storage to only store id and use the sender from the above mentioned hashmap

mod app_state;
mod config;
mod lobby;
mod lobic_db;
mod routes;
mod schema;
mod user_pool;
mod utils;

use app_state::AppState;
use config::{allowed_origins, IP, PORT};
use routes::{
	get_music::{get_cover_image, get_music, send_music},
	get_user::get_user,
	login::login,
	playlist::create_playlist,
	save_music::save_music,
	search::search_music,
	signup::signup,
	socket::websocket_handler,
	verify::verify,
};

use axum::{
	body::Body,
	http::{header, Method, Request},
	middleware::Next,
	response::Response,
	routing::{get, post},
	Router,
};
use colored::*;
use diesel::prelude::*;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use dotenv::dotenv;
use std::time::Instant;
use tokio::net::TcpListener;
use tower_http::cors::{AllowOrigin, CorsLayer};

// Embed migrations into the binary
pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

/// Runs embedded migrations on the database connection
fn run_migrations(db_url: &str) {
	let mut conn = SqliteConnection::establish(db_url).expect("Failed to connect to the database");

	conn.run_pending_migrations(MIGRATIONS)
		.expect("Failed to run migrations");
}

async fn index() -> Response<String> {
	Response::builder()
		.status(200)
		.body("Hello from Lobic backend".to_string())
		.unwrap()
}

async fn logger(req: Request<Body>, next: Next) -> Response {
	let start = Instant::now();
	let method = req.method().to_string();
	let uri = req.uri().to_string();

	let response = next.run(req).await;

	let colored_method = match method.as_str() {
		"GET" => method.bright_green(),
		"POST" => method.bright_yellow(),
		"PUT" => method.bright_blue(),
		"DELETE" => method.bright_red(),
		_ => method.normal(),
	};

	let status = response.status();
	let colored_status = if status.is_success() {
		status.as_u16().to_string().green()
	} else if status.is_client_error() {
		status.as_u16().to_string().yellow()
	} else if status.is_server_error() {
		status.as_u16().to_string().red()
	} else {
		status.as_u16().to_string().normal()
	};

	println!(
		"{:<6} {:<20} | status: {:<4} | latency: {:<10.2?}",
		colored_method,
		uri.bright_white(),
		colored_status,
		start.elapsed()
	);

	response
}

#[tokio::main]
async fn main() {
	dotenv().ok();
	tracing_subscriber::fmt().pretty().init();

	let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env file");
	run_migrations(&db_url);

	// Creating the global state
	let app_state = AppState::new();

	let cors = CorsLayer::new()
		.allow_origin(AllowOrigin::predicate(allowed_origins))
		.allow_credentials(true)
		.allow_methods([Method::GET, Method::POST, Method::OPTIONS])
		.allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE]);

	let app = Router::new()
		.route("/", get(index))
		.route("/get_user", get(get_user))
		.route("/signup", post(signup))
		.route("/login", post(login))
		.route("/verify", get(verify))
		.route("/music/:path", get(send_music))
		.route("/image/:filename", get(get_cover_image))
		.route("/save_music", post(save_music))
		.route("/get_music", get(get_music))
		.route("/search", get(search_music))
		.route("/playlist/new", post(create_playlist))
		.route("/ws", get(websocket_handler))
		.with_state(app_state)
		.layer(axum::middleware::from_fn(logger))
		.layer(cors);

	println!(
		"{}: {}",
		"Server hosted at".green(),
		format!("http://{IP}:{PORT}").cyan()
	);

	let listener = TcpListener::bind(format!("{IP}:{PORT}")).await.unwrap();
	axum::serve(listener, app).await.unwrap();
}
