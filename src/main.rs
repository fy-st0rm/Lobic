mod config;
mod lobic_db;
mod schema;

use config::{IP, PORT};
use dotenv::dotenv;
use lobic_db::{db::*, models::*};
use schema::users::dsl::*;

use axum::{response::Response, routing::get, Router};
use diesel::prelude::*;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use tokio::net::TcpListener;
use tower_http::{trace, trace::TraceLayer};
use tracing::Level;

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

async fn db_test(db_pool: DatabasePool) -> Response<String> {
    let mut conn = db_pool.get().unwrap();

    let new_user = User {
        id: "123".to_string(),
        username: "test".to_string(),
        email: "test@gmail.com".to_string(),
        pwd_hash: "#123#".to_string(),
    };

    diesel::insert_into(users)
        .values(&new_user)
        .execute(&mut conn)
        .unwrap();

    Response::builder()
        .status(200)
        .body("Just testing database".to_string())
        .unwrap()
}

#[tokio::main]
async fn main() {
    dotenv().ok();
    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env file");

    run_migrations(&db_url);

    let db_pool = generate_db_pool();

    tracing_subscriber::fmt().pretty().init();

    let app = Router::new()
        .route("/", get(index))
        .route(
            "/db",
            get({
                let pool = db_pool.clone();
                || db_test(pool)
            }),
        )
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(trace::DefaultMakeSpan::new().level(Level::INFO))
                .on_response(trace::DefaultOnResponse::new().level(Level::INFO)),
        );

    println!("Server hosted at: http://{IP}:{PORT}");
    let listener = TcpListener::bind(format!("{IP}:{PORT}")).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
