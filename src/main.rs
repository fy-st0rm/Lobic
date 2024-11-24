mod config;
mod schema;
mod lobic_db;

use config::{
	IP, PORT
};
use lobic_db::{
	db::*,
	models::*
};
use schema::users::dsl::*;

use diesel::prelude::*;
use tokio::net::TcpListener;
use tracing::Level;
use tower_http::{
	trace,
	trace::TraceLayer,
};
use axum::{
	routing::get,
	response::Response,
	Router,
};

async fn index() -> Response<String> {
	Response::builder()
		.status(200)
		.body("Hello from Lobic backend".to_string()).unwrap()
}

async fn db_test(db_pool: DatabasePool) -> Response<String> {
	let mut conn = db_pool.get().unwrap();

	let new_user = User {
		id: "123".to_string(),
		username: "test".to_string(),
		email: "test@gmail.com".to_string(),
		pwd_hash: "#123#".to_string()
	};

	diesel::insert_into(users)
		.values(&new_user)
		.execute(&mut conn)
		.unwrap();

	Response::builder()
		.status(200)
		.body("Just testing database".to_string()).unwrap()
}

#[tokio::main]
async fn main() {
	let db_pool = generate_db_pool();

	tracing_subscriber::fmt()
		.pretty()
		.init();

	let app = Router::new()
		.route("/", get(index))
		.route("/db", get({
			let pool = db_pool.clone();
			|| db_test(pool)
		}))
		.layer(TraceLayer::new_for_http()
			.make_span_with(trace::DefaultMakeSpan::new().level(Level::INFO))
			.on_response(trace::DefaultOnResponse::new().level(Level::INFO)),
		);

	println!("Server hosted at: http://{IP}:{PORT}");
	let listener = TcpListener::bind(
		format!("{IP}:{PORT}")
	)
		.await
		.unwrap();
	axum::serve(listener, app).await.unwrap();
}
