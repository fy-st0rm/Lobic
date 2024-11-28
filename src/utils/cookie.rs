use cookie::{
	Cookie,
	SameSite,
};
use time::Duration;

pub fn create(key: &str, value: &str, exp_in_sec: i64) -> String {
	Cookie::build((key, value))
		.http_only(true)
		.same_site(SameSite::None)
		.secure(true)
		.path("/")
		.max_age(Duration::new(exp_in_sec, 0))
		.build()
		.to_string()
}

