use crate::lobic_db::{
	db::DatabasePool,
	models::User,
};
use crate::schema::users::dsl::*;
use crate::auth::{ jwt, exp };

use time::Duration;
use diesel::prelude::*;
use serde::{ Serialize, Deserialize };
use axum::{
	Json,
	response::Response,
	http::{
		header,
		status::StatusCode,
	},
};
use pwhash::bcrypt;
use cookie::Cookie;

#[derive(Debug, Serialize, Deserialize )]
pub struct LoginPayload {
	pub email: String,
	pub password: String,
}

pub async fn login(
	Json(payload): Json<LoginPayload>,
	db_pool: DatabasePool
) -> Response<String> {
	println!("{:#?}", payload);
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

	// Create cookies for access and refresh tokens
	let access_cookie = Cookie::build(("access_token", access_token))
			.http_only(true)
			.secure(true)
			.max_age(Duration::new(3600, 0)) // 1 hour
			.build();

	let refresh_cookie = Cookie::build(("refresh_token", refresh_token))
			.http_only(true)
			.secure(true)
			.max_age(Duration::new(604800, 0)) // 7 days
			.build();

	// Response
	Response::builder()
		.status(StatusCode::OK)
		.header(header::SET_COOKIE, access_cookie.to_string())
		.header(header::SET_COOKIE, refresh_cookie.to_string())
		.body("Login successful".to_string())
		.unwrap()
}
