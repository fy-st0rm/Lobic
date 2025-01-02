use crate::lobic_db::db::*;
use crate::lobby::LobbyPool;

#[derive(Debug, Clone)]
pub struct AppState {
	pub db_pool: DatabasePool,
	pub lobby_pool: LobbyPool,
}

impl AppState {
	pub fn new() -> AppState {
		AppState {
			db_pool: generate_db_pool(),
			lobby_pool: LobbyPool::new(),
		}
	}
}

