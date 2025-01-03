use jsonwebtoken::{
	decode, encode, errors::Result, Algorithm, DecodingKey, EncodingKey, Header, TokenData,
	Validation,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
	pub id: String,
	pub exp: usize,
}

pub fn generate(claims: Claims, secret_key: &str) -> Result<String> {
	encode(
		&Header::default(),
		&claims,
		&EncodingKey::from_secret(secret_key.as_bytes()),
	)
}

pub fn verify(token: &str, secret_key: &str) -> Result<TokenData<Claims>> {
	decode::<Claims>(
		&token,
		&DecodingKey::from_secret(secret_key.as_bytes()),
		&Validation::new(Algorithm::HS256),
	)
}
