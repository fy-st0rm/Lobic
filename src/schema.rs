// @generated automatically by Diesel CLI.

diesel::table! {
	music (music_id) {
		music_id -> Text,
		filename -> Text,
		artist -> Text,
		title -> Text,
		album -> Text,
		genre -> Text,
	}
}

diesel::table! {
	playlist_shares (playlist_id, shared_to_user_id) {
		playlist_id -> Text,
		owner_user_id -> Text,
		shared_to_user_id -> Text,
		share_permission -> Text,
	}
}

diesel::table! {
	playlist_songs (playlist_id, music_id) {
		playlist_id -> Text,
		music_id -> Text,
		position -> Integer,
		song_added_date_time -> Text,
	}
}

diesel::table! {
	playlists (playlist_id) {
		playlist_id -> Text,
		playlist_name -> Text,
		user_id -> Text,
		description -> Nullable<Text>,
		creation_date_time -> Text,
		last_updated_date_time -> Text,
	}
}

diesel::table! {
	users (user_id) {
		user_id -> Text,
		username -> Text,
		email -> Text,
		pwd_hash -> Text,
	}
}

diesel::joinable!(playlist_shares -> playlists (playlist_id));
diesel::joinable!(playlist_songs -> music (music_id));
diesel::joinable!(playlist_songs -> playlists (playlist_id));
diesel::joinable!(playlists -> users (user_id));

diesel::allow_tables_to_appear_in_same_query!(
	music,
	playlist_shares,
	playlist_songs,
	playlists,
	users,
);
