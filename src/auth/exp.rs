use std::time::{
	SystemTime,
	UNIX_EPOCH,
	Duration
};

pub fn expiration_from_min(min: u64) -> usize {
	(SystemTime::now() + Duration::from_secs(min * 60))
		.duration_since(UNIX_EPOCH)
		.unwrap()
		.as_secs() as usize
}

pub fn expiration_from_days(days: u64) -> usize {
	(SystemTime::now() + Duration::from_secs(days * 24 * 60 * 60))
		.duration_since(UNIX_EPOCH)
		.unwrap()
		.as_secs() as usize
}

