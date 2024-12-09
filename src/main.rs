/*
 * TODO:
 * [ ] Implement Leave and Delete lobby
 * [ ] Implement auto deletion when host disconnects
 * [ ] Implement AppState functionality to routes
 * [ ] Implement verify route as middleware (if needed)
 */

mod config;
mod lobic_db;
mod routes;
mod auth;
mod schema;
mod utils;
mod lobby;

use lobby::*;
use config::{ IP, PORT, ORIGIN };
use lobic_db::db::*;
use routes::{
	login::login,
	signup::signup,
	verify::verify,
	socket::websocket_handler,
};

use diesel::prelude::*;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;
use axum::{
	body::Body,
	routing::{ get, post },
	response::Response,
	Router,
	middleware::Next,
	http::{
		Request,
		Method,
		HeaderValue,
		header,
	},
};
use dotenv::dotenv;
use std::time::Instant;
use colored::*;

// Embed migrations into the binary
pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

/// Runs embedded migrations on the database connection
fn run_migrations(db_url: &str) {
	let mut conn = SqliteConnection::establish(db_url)
		.expect("Failed to connect to the database");

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

	let db_url = std::env::var("DATABASE_URL")
		.expect("DATABASE_URL must be set in .env file");
	run_migrations(&db_url);

	// Pool of database connections
	let db_pool = generate_db_pool();

	// Create lobby pool
	let lobby_pool: LobbyPool = LobbyPool::new();

	let cors = CorsLayer::new()
		.allow_origin(ORIGIN.parse::<HeaderValue>().unwrap())
		.allow_credentials(true)
		.allow_methods([Method::GET, Method::POST, Method::OPTIONS])
		.allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE]);

	let app = Router::new()
		.route("/", get(index))

		.route("/signup", post({
			let db_pool = db_pool.clone();
			|payload| signup(payload, db_pool)
		}))
		.route("/login", post({
			let db_pool = db_pool.clone();
			|payload| login(payload, db_pool)
		}))
		.route("/verify", get(verify))

		.route("/ws", get({
			let lobby_pool = lobby_pool.clone();
			let db_pool = db_pool.clone();
			|payload| websocket_handler(payload, db_pool, lobby_pool)
		}))

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
