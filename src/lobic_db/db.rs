use crate::lobic_db::models::User;
use crate::schema::users::dsl::*;

use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool};

pub type DatabasePool = Pool<ConnectionManager<SqliteConnection>>;

pub fn generate_db_pool() -> DatabasePool {
	let database_url =
		std::env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env file");

	let manager = ConnectionManager::<SqliteConnection>::new(database_url);
	Pool::builder()
		.max_size(5)
		.build(manager)
		.expect("Failed to create pool")
}

pub fn user_exists(user_id: &str, db_pool: &DatabasePool) -> bool {
	let mut db_conn = match db_pool.get() {
		Ok(conn) => conn,
		Err(_) => {
			println!("[user_exists]: Cannot get databse through pool");
			return false;
		}
	};

	let query = users.filter(id.eq(user_id)).first::<User>(&mut db_conn);

	query.is_ok()
}
