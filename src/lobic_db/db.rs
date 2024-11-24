use diesel::r2d2::{
	ConnectionManager,
	Pool,
};
use diesel::prelude::*;
use dotenv::dotenv;

pub type DatabasePool = Pool<ConnectionManager<SqliteConnection>>;

pub fn generate_db_pool() -> DatabasePool {
	dotenv().ok();

	let database_url = std::env::var("DATABASE_URL")
		.expect("DATABASE_URL must be set in .env file");

	let manager = ConnectionManager::<SqliteConnection>::new(database_url);
	Pool::builder()
		.max_size(5)
		.build(manager)
		.expect("Failed to create pool")
}
