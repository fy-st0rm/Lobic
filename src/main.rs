/*
 * TODO:
 * [ ] Implement Leave and Delete lobby
 * [ ] Implement auto deletion when host disconnects
 * [ ] Implement AppState functionality to routes
 * [ ] Implement verify route as middleware (if needed)
 */

mod auth;
mod config;
mod lobby;
mod lobic_db;
mod routes;
mod schema;
mod utils;

use config::{allowed_origins, IP, PORT};
use futures::poll;
use lobby::*;
use lobic_db::db::*;
use routes::{
	get_music::{
		get_all_music, get_cover_image, get_music_by_title, get_music_by_uuid, send_music,
	},
	get_user::get_user,
	login::login,
	save_music::save_music,
	signup::signup,
	socket::websocket_handler,
	verify::verify,
};

use axum::{
	body::Body,
	http::{header, HeaderValue, Method, Request},
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

	// Pool of database connections
	let db_pool = generate_db_pool();

	// Create lobby pool
	let lobby_pool: LobbyPool = LobbyPool::new();

	let cors = CorsLayer::new()
		.allow_origin(AllowOrigin::predicate(allowed_origins))
		.allow_credentials(true)
		.allow_methods([Method::GET, Method::POST, Method::OPTIONS])
		.allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE]);

	let app = Router::new()
		.route("/", get(index))
		.route("/get_user", get(get_user))
		.route(
			"/signup",
			post({
				let db_pool = db_pool.clone();
				|payload| signup(payload, db_pool)
			}),
		)
		.route(
			"/login",
			post({
				let db_pool = db_pool.clone();
				|payload| login(payload, db_pool)
			}),
		)
		.route("/verify", get(verify))
		.route(
			"/save_music",
			post({
				let pool = db_pool.clone();
				|payload| save_music(payload, pool)
			}),
		)
		.route(
			"/music_data_by_title",
			get({
				let db_pool = db_pool.clone();
				|payload| get_music_by_title(payload, db_pool)
			}),
		)
		.route(
			"/music_data_by_uuid",
			get({
				let db_pool = db_pool.clone();
				|payload| get_music_by_uuid(payload, db_pool)
			}),
		)
		.route(
			"/musics_data",
			get({
				let db_pool = db_pool.clone();
				move || async { get_all_music(db_pool).await }
			}),
		)
		.route("/music", get(send_music)) //to test just vlc http://127.0.0.1:8080/music/
		.route(
			"/image/:filename",
			get(|music_uuid| get_cover_image(music_uuid)),
		)
		.route(
			"/ws",
			get({
				let lobby_pool = lobby_pool.clone();
				let db_pool = db_pool.clone();
				|payload| websocket_handler(payload, db_pool, lobby_pool)
			}),
		)
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
