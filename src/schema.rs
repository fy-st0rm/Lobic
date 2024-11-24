// @generated automatically by Diesel CLI.

diesel::table! {
    users (id) {
        id -> Text,
        username -> Text,
        email -> Text,
        pwd_hash -> Text,
    }
}
