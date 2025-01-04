use crate::app_state::AppState;
use crate::lobic_db::models::User;
use crate::schema::users::dsl::*;
use crate::utils::{cookie, exp, jwt};

use axum::{
	extract::State,
	http::{header, status::StatusCode},
	response::Response,
	Json,
};
use diesel::prelude::*;
use pwhash::bcrypt;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginPayload {
	pub email: String,
	pub password: String,
}

pub async fn login(
	State(app_state): State<AppState>,
	Json(payload): Json<LoginPayload>,
) -> Response<String> {
	// Getting db from pool
	let mut db_conn = match app_state.db_pool.get() {
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
	let jwt_secret_key =
		std::env::var("JWT_SECRET_KEY").expect("JWT_SECRET_KEY must be set in .env file");

	let access_claims = jwt::Claims {
		id: user.id.clone(),
		exp: exp::expiration_from_min(60),
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
		exp: exp::expiration_from_days(7),
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

	// Create cookies for access and refresh tokens
	let user_cookie = cookie::create("user_id", &user.id, 60 * 60, false);
	let access_cookie = cookie::create("access_token", &access_token, 60 * 60, true);
	let refresh_cookie = cookie::create("refresh_token", &refresh_token, 7 * 24 * 60 * 60, true);

	Response::builder()
		.status(StatusCode::OK)
		.header(header::SET_COOKIE, user_cookie)
		.header(header::SET_COOKIE, access_cookie)
		.header(header::SET_COOKIE, refresh_cookie)
		.body("OK".to_string())
		.unwrap()
}
