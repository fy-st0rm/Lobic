use axum::http::{ HeaderValue, request::Parts };

pub const IP: &str = "127.0.0.1";
pub const PORT: &str = "8080";

pub fn allowed_origins(origin: &HeaderValue, _request: &Parts) -> bool {
	let origins = [
		"http://localhost:5173",
		"http://127.0.0.1:5173",
		"http://localhost:5174",
		"http://127.0.0.1:5174",
		"http://localhost:5175",
		"http://127.0.0.1:5175",
	];
	origins.iter().any(|&allowed| origin == allowed)
}


