mod config;
mod lobic_db;
mod routes;
mod auth;
mod schema;

use config::{IP, PORT};
use lobic_db::db::*;
use routes::signup::signup;

use diesel::prelude::*;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use tokio::net::TcpListener;
use tracing::Level;
use tower_http::{
	trace,
	trace::TraceLayer,
};
use axum::{
	routing::{ get, post },
	response::Response,
	Router,
};
use dotenv::dotenv;

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

#[tokio::main]
async fn main() {
	dotenv().ok();
	tracing_subscriber::fmt().pretty().init();

	let db_url = std::env::var("DATABASE_URL")
		.expect("DATABASE_URL must be set in .env file");
	run_migrations(&db_url);

	// Pool of database connections
	let db_pool = generate_db_pool();

	let app = Router::new()
		.route("/", get(index))
		.route("/signup", post({
			let pool = db_pool.clone();
			|payload| signup(payload, pool)
		}))
		.layer(TraceLayer::new_for_http()
			.make_span_with(trace::DefaultMakeSpan::new().level(Level::INFO))
			.on_response(trace::DefaultOnResponse::new().level(Level::INFO)),
		);

	println!("Server hosted at: http://{IP}:{PORT}");
	let listener = TcpListener::bind(format!("{IP}:{PORT}")).await.unwrap();
	axum::serve(listener, app).await.unwrap();
}
