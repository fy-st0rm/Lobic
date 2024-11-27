use crate::lobic_db::{
	db::DatabasePool,
	models::User,
};
use crate::schema::users::dsl::*;
use crate::auth::{ jwt, exp };

use diesel::prelude::*;
use serde::{ Serialize, Deserialize };
use serde_json::json;
use axum::{
	Json,
	response::Response,
	http::status::StatusCode,
};
use pwhash::bcrypt;

#[derive(Debug, Serialize, Deserialize )]
pub struct LoginPayload {
	pub email: String,
	pub password: String,
}

pub async fn login(
	Json(payload): Json<LoginPayload>,
	db_pool: DatabasePool
) -> Response<String> {
	// Getting db from pool
	let mut db_conn = match db_pool.get() {
		Ok(conn) => conn,
		Err(err) => {
			let msg = format!("Failed to get DB from pool: {err}");
			return Response::builder()
				.status(StatusCode::INTERNAL_SERVER_ERROR)
				.body(msg)
				.unwrap();
		}
	};

	// Searching if the email exists
	let query = users
		.filter(email.eq(&payload.email))
		.first::<User>(&mut db_conn);

	// Getting the user
	let user = match query {
		Ok(data) => data,
		Err(_) => {
			return Response::builder()
				.status(StatusCode::BAD_REQUEST)
				.body(format!(
					"Account with email {} doesn't exists",
					&payload.email
				))
				.unwrap();
		}
	};

	// Checking the password
	if !bcrypt::verify(&payload.password, &user.pwd_hash) {
		return Response::builder()
			.status(StatusCode::BAD_REQUEST)
			.body("Incorrent password".to_string())
			.unwrap();
	}

	// Generate jwt
	let jwt_secret_key = std::env::var("JWT_SECRET_KEY")
		.expect("JWT_SECRET_KEY must be set in .env file");

	let access_claims = jwt::Claims {
		id: user.id.clone(),
		exp: exp::expiration_from_min(60)
	};
	let access_token = match jwt::generate(access_claims, &jwt_secret_key) {
		Ok(token) => token,
		Err(err) => {
			return Response::builder()
				.status(StatusCode::INTERNAL_SERVER_ERROR)
				.body(err.to_string())
				.unwrap();
		}
	};

	let refresh_claims = jwt::Claims {
		id: user.id.clone(),
		exp: exp::expiration_from_days(7)
	};
	let refresh_token = match jwt::generate(refresh_claims, &jwt_secret_key) {
		Ok(token) => token,
		Err(err) => {
			return Response::builder()
				.status(StatusCode::INTERNAL_SERVER_ERROR)
				.body(err.to_string())
				.unwrap();
		}
	};

	// Response
	let json_obj = json!({
		"access_token": access_token,
		"request_token": refresh_token
	});
	let response_msg = serde_json::to_string_pretty(&json_obj).unwrap();

	Response::builder()
		.status(StatusCode::OK)
		.body(response_msg)
		.unwrap()
}
