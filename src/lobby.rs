use crate::config::OpCode;
use crate::lobic_db::db::*;
use crate::user_pool::UserPool;
use crate::utils::timestamp;

use axum::extract::ws::Message;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatValue {
	pub user_id: String,
	pub message: String,
	pub timestamp: String,
}
type Chat = Vec<ChatValue>;

#[derive(Debug, Clone)]
pub struct Lobby {
	pub id: String,
	pub host_id: String,
	pub clients: Vec<String>,
	pub chat: Chat,
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

	pub fn exists(&self, key: &str) -> bool {
		let inner = self.inner.lock().unwrap();
		inner.contains_key(key)
	}

	pub fn get_ids(&self) -> Vec<String> {
		let inner = self.inner.lock().unwrap();
		inner.clone().into_keys().collect()
	}

	pub fn get(&self, key: &str) -> Option<Lobby> {
		let inner = self.inner.lock().unwrap();
		inner.get(key).cloned()
	}

	pub fn get_msgs(&self, lobby_id: &str) -> Option<Chat> {
		if !self.exists(lobby_id) {
			return None;
		}
		let lobby = self.get(lobby_id).unwrap();
		Some(lobby.chat)
	}

	pub fn insert(&self, key: &str, lobby: Lobby) {
		let mut inner = self.inner.lock().unwrap();
		inner.insert(key.to_string(), lobby);
	}

	pub fn create_lobby(&self, host_id: &str, db_pool: &DatabasePool) -> Result<Value, String> {
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
			clients: vec![host_id.to_string()],
			chat: Vec::new(),
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
	) -> Result<Value, String> {
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

		// Check if client is already joined
		if lobby.clients.contains(&client_id.to_string()) {
			return Err(format!(
				"Client: {} is already in lobby: {}",
				client_id, lobby_id
			));
		}

		// Adding the client and pushing into the pool
		lobby.clients.push(client_id.to_string());
		self.insert(lobby_id, lobby);

		// Constructing response
		let response = json!({
			"lobby_id": lobby_id
		});

		Ok(response)
	}

	pub fn leave_lobby(
		&self,
		lobby_id: &str,
		client_id: &str,
		db_pool: &DatabasePool,
	) -> Result<String, String> {
		if !user_exists(client_id, db_pool) {
			return Err(format!("Invalid client id: {}", client_id));
		}

		// Getting the lobby to leave
		let mut inner = self.inner.lock().unwrap();
		let lobby = match inner.get_mut(lobby_id) {
			Some(lobby) => lobby,
			None => {
				return Err(format!("Invalid lobby id: {}", lobby_id));
			}
		};

		lobby.clients.retain(|id| id != client_id);
		Ok("Sucessfully left lobby".to_string())
	}

	pub fn delete_lobby(&self, lobby_id: &str, user_pool: &UserPool) -> Result<String, String> {
		// Getting the lobby to leave
		let lobby = match self.get(lobby_id) {
			Some(lobby) => lobby,
			None => {
				return Err(format!("Invalid lobby id: {}", lobby_id));
			}
		};

		// Notifying all the clients in the lobby to leave
		for client in lobby.clients {
			if let Some(conn) = user_pool.get(&client) {
				let response = json!({
					"op_code": OpCode::OK,
					"for": OpCode::LEAVE_LOBBY,
					"value": "Host disconnected"
				})
				.to_string();
				let _ = conn.send(Message::Text(response));
			}
		}

		// Deleting the lobby
		let mut inner = self.inner.lock().unwrap();
		let _ = inner.remove(lobby_id);

		Ok("Sucessfully deleted lobby".to_string())
	}

	pub fn append_message(
		&self,
		lobby_id: &str,
		client_id: &str,
		msg: &str,
		db_pool: &DatabasePool,
	) -> Result<(), String> {
		if !user_exists(client_id, db_pool) {
			return Err(format!("Invalid client id: {}", client_id));
		}

		let mut inner = self.inner.lock().unwrap();
		let lobby = match inner.get_mut(lobby_id) {
			Some(lobby) => lobby,
			None => {
				return Err(format!("Invalid lobby id: {}", lobby_id));
			}
		};

		if !lobby.clients.contains(&client_id.to_string()) {
			return Err(format!(
				"Client: {} is not a member in lobby: {}",
				client_id, lobby_id
			));
		}

		lobby.chat.push(ChatValue {
			user_id: client_id.to_string(),
			message: msg.to_string(),
			timestamp: timestamp::now(),
		});
		Ok(())
	}
}
