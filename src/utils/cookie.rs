use cookie::{
	Cookie,
	SameSite,
};
use time::Duration;

pub fn create(key: &str, value: &str, exp_in_sec: i64, http_only: bool) -> String {
	Cookie::build((key, value))
		.http_only(http_only)
		.same_site(SameSite::None)
		.secure(http_only)
		.path("/")
		.max_age(Duration::new(exp_in_sec, 0))
		.build()
		.to_string()
}

