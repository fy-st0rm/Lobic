use axum::http::{request::Parts, HeaderValue};
use serde::{Deserialize, Serialize};

pub const IP: &str = "127.0.0.1";
pub const PORT: &str = "8080";

#[derive(Debug, Serialize, Deserialize)]
pub enum OpCode {
	OK,
	ERROR,
	CONNECT,
	#[allow(non_camel_case_types)]
	CREATE_LOBBY,
	#[allow(non_camel_case_types)]
	JOIN_LOBBY,
	#[allow(non_camel_case_types)]
	LEAVE_LOBBY,
	#[allow(non_camel_case_types)]
	DELETE_LOBBY,
	#[allow(non_camel_case_types)]
	GET_LOBBY_IDS,
	MESSAGE,
	#[allow(non_camel_case_types)]
	GET_MESSAGES,
}

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
