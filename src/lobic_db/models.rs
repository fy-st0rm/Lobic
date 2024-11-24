use crate::schema::users;
use diesel::{
	Insertable,
	Queryable,
};

#[derive(Insertable, Queryable, Debug)]
#[diesel(table_name = users)]
pub struct User {
	pub id: String,
	pub username: String,
	pub email: String,
	pub pwd_hash: String,
}
