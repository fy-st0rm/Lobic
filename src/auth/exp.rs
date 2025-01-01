use std::time::{Duration, SystemTime, UNIX_EPOCH};

pub fn expiration_from_sec(sec: u64) -> usize {
	(SystemTime::now() + Duration::from_secs(sec))
		.duration_since(UNIX_EPOCH)
		.unwrap()
		.as_secs() as usize
}

pub fn expiration_from_min(min: u64) -> usize {
	expiration_from_sec(min * 60)
}

pub fn expiration_from_days(days: u64) -> usize {
	expiration_from_sec(days * 24 * 60 * 60)
}
