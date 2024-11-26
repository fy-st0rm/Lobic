mod config;
mod schema;
mod lobic_db;
mod routes;
mod auth;

use config::{
	IP, PORT
};
use lobic_db::{
	db::*,
	models::*
};
use schema::users::dsl::*;
use routes::signup::signup;

use diesel::prelude::*;
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

async fn index() -> Response<String> {
	Response::builder()
		.status(200)
		.body("Hello from Lobic backend".to_string()).unwrap()
}

#[tokio::main]
async fn main() {
	dotenv().ok();

	let db_pool = generate_db_pool();

	tracing_subscriber::fmt()
		.pretty()
		.init();

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
	let listener = TcpListener::bind(
		format!("{IP}:{PORT}")
	)
		.await
		.unwrap();
	axum::serve(listener, app).await.unwrap();
}
