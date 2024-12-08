// @generated automatically by Diesel CLI.

diesel::table! {
    music (id) {
        id -> Integer,
        title -> Text,
        artist -> Text,
        album -> Text,
        file_path -> Text,
        duration -> Integer,
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

diesel::allow_tables_to_appear_in_same_query!(
    music,
    users,
);
