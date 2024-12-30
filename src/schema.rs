// @generated automatically by Diesel CLI.

diesel::table! {
    music (id) {
        id -> Nullable<Text>,
        filename -> Text,
        artist -> Nullable<Text>,
        title -> Nullable<Text>,
        album -> Nullable<Text>,
        genre -> Nullable<Text>,
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
