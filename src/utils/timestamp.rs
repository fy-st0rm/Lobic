use chrono::{Local, Timelike};

pub fn now() -> String {
	let now = Local::now();
	let hour = now.hour();
	let minute = now.minute();

	let (hour12, period) = if hour == 0 {
		(12, "AM")
	} else if hour < 12 {
		(hour, "AM")
	} else if hour == 12 {
		(12, "PM")
	} else {
		(hour - 12, "PM")
	};

	let timestamp = format!("{:02}:{:02} {}", hour12, minute, period);
	return timestamp;
}
