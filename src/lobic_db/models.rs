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

#[derive(Insertable, Queryable, Debug)]
#[diesel(table_name = music)]

pub struct Music {
    pub id: String,
    pub filename: String,
    pub artist: String,
    pub title: String,
    pub album: String,
    pub genre: String,
}