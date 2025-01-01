// @generated automatically by Diesel CLI.

diesel::table! {
	music (id) {
		id -> Text,
		filename -> Text,
		artist -> Text,
		title -> Text,
		album -> Text,
		genre -> Text,
	}
}

diesel::table! {
	users (id) {
		id -> Text,
		username -> Text,
		email -> Text,
		pwd_hash -> Text,
	}
}

diesel::allow_tables_to_appear_in_same_query!(music, users,);
