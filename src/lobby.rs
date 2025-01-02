use crate::lobic_db::db::*;

use serde_json::{json, Value};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct Lobby {
	pub id: String,
	pub host_id: String,
	pub clients: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct LobbyPool {
	inner: Arc<Mutex<HashMap<String, Lobby>>>,
}

impl LobbyPool {
	pub fn new() -> LobbyPool {
		LobbyPool {
			inner: Arc::new(Mutex::new(HashMap::new())),
		}
	}

	pub fn get_ids(&self) -> Vec<String> {
		let inner = self.inner.lock().unwrap();
		inner.clone().into_keys().collect()
	}

	pub fn get(&self, key: &str) -> Option<Lobby> {
		let inner = self.inner.lock().unwrap();
		inner.get(key).cloned()
	}

	pub fn exists(&self, key: &str) -> bool {
		let inner = self.inner.lock().unwrap();
		inner.contains_key(key)
	}

	pub fn insert(&self, key: &str, lobby: Lobby) {
		let mut inner = self.inner.lock().unwrap();
		inner.insert(key.to_string(), lobby);
	}

	pub fn create_lobby(
		&self,
		host_id: &str,
		db_pool: &DatabasePool,
	) -> Result<Value, String> {
		if !user_exists(host_id, db_pool) {
			return Err(format!("Invalid host id: {}", host_id));
		}

		// Generating lobby id
		let mut lobby_id = Uuid::new_v4().to_string();
		while self.exists(&lobby_id) {
			lobby_id = Uuid::new_v4().to_string();
		}

		// Constructing lobby
		let lobby = Lobby {
			id: lobby_id.clone(),
			host_id: host_id.to_string(),
			clients: vec![host_id.to_string()]
		};
		self.insert(&lobby_id, lobby);

		// Constructing response
		let response = json!({
			"lobby_id": lobby_id
		});

		Ok(response)
	}

	pub fn join_lobby(
		&self,
		lobby_id: &str,
		client_id: &str,
		db_pool: &DatabasePool,
	) -> Result<String, String> {
		if !user_exists(client_id, db_pool) {
			return Err(format!("Invalid client id: {}", client_id));
		}

		// Getting the lobby to be joined
		let mut lobby = match self.get(lobby_id) {
			Some(lobby) => lobby,
			None => {
				return Err(format!("Invalid lobby id: {}", lobby_id));
			}
		};

		// Adding the client and pushing into the pool
		lobby.clients.push(client_id.to_string());
		self.insert(lobby_id, lobby);

		Ok("Sucessfully joined lobby".to_string())
	}
}
