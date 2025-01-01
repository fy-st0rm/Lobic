use crate::auth::{exp, jwt};
use crate::lobic_db::{db::DatabasePool, models::User};
use crate::schema::users::dsl::*;
use crate::utils::cookie;

use axum::{
	http::{header, status::StatusCode},
	response::Response,
	Json,
};
use diesel::prelude::*;
use pwhash::bcrypt;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct SignupPayload {
	pub username: String,
	pub email: String,
	pub password: String,
}

pub async fn signup(Json(payload): Json<SignupPayload>, db_pool: DatabasePool) -> Response<String> {
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

	// Searching if the email already exists
	let query = users
		.filter(email.eq(&payload.email))
		.first::<User>(&mut db_conn);

	// Email already registered
	if query.is_ok() {
		return Response::builder()
			.status(StatusCode::BAD_REQUEST)
			.body(format!(
				"Account with email {} has already been registered",
				&payload.email
			))
			.unwrap();
	}

	// Create new user
	let user_id = Uuid::new_v4().to_string();
	let new_user = User {
		id: user_id.clone(),
		username: payload.username,
		email: payload.email,
		pwd_hash: bcrypt::hash(payload.password).unwrap(),
	};

	// Insert into the database
	diesel::insert_into(users)
		.values(&new_user)
		.execute(&mut db_conn)
		.unwrap();

	// Generate jwt
	let jwt_secret_key =
		std::env::var("JWT_SECRET_KEY").expect("JWT_SECRET_KEY must be set in .env file");

	let access_claims = jwt::Claims {
		id: user_id.clone(),
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
		id: user_id.clone(),
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
	let access_cookie = cookie::create("access_token", &access_token, 60 * 60);
	let refresh_cookie = cookie::create("refresh_token", &refresh_token, 7 * 24 * 60 * 60);

	Response::builder()
		.status(StatusCode::OK)
		.header(header::SET_COOKIE, access_cookie)
		.header(header::SET_COOKIE, refresh_cookie)
		.body("OK".to_string())
		.unwrap()
}
