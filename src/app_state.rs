use crate::lobic_db::db::*;
use crate::lobby::LobbyPool;
use crate::user_pool::UserPool;

#[derive(Debug, Clone)]
pub struct AppState {
	pub db_pool: DatabasePool,
	pub lobby_pool: LobbyPool,
	pub user_pool: UserPool,
}

impl AppState {
	pub fn new() -> AppState {
		AppState {
			db_pool: generate_db_pool(),
			lobby_pool: LobbyPool::new(),
			user_pool: UserPool::new(),
		}
	}
}

