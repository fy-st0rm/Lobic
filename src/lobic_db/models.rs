use crate::schema::{users, music};
use diesel::{Insertable, Queryable};

#[derive(Insertable, Queryable, Debug)]
#[diesel(table_name = users)]
pub struct User {
    pub id: String,
    pub username: String,
    pub email: String,
    pub pwd_hash: String,
}

#[derive(Queryable)]
pub struct Music {
    pub id: i32,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub file_path: String,
    pub duration: i32,
}

#[derive(Insertable)]
#[diesel(table_name = music)]
pub struct NewMusic<'a> {
    pub title: &'a str,
    pub artist: &'a str,
    pub album: &'a str,
    pub file_path: &'a str,
    pub duration: i32,
}
