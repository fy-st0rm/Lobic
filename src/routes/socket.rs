use crate::lobby::*;
use crate::lobic_db::db::*;

use axum::{
	extract::ws::{Message, WebSocket, WebSocketUpgrade},
	response::IntoResponse,
};
use futures::{sink::SinkExt, stream::StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tokio::sync::broadcast;

#[derive(Debug, Serialize, Deserialize)]
enum OpCode {
	OK,
	ERROR,
	#[allow(non_camel_case_types)]
	CREATE_LOBBY,
	#[allow(non_camel_case_types)]
	JOIN_LOBBY,
	#[allow(non_camel_case_types)]
	LEAVE_LOBBY,
	#[allow(non_camel_case_types)]
	DELETE_LOBBY,
	#[allow(non_camel_case_types)]
	GET_LOBBY_IDS,
	MESSAGE,
}

#[derive(Debug, Serialize, Deserialize)]
struct SocketPayload {
	pub op_code: OpCode,
	pub value: Value,
}

pub async fn websocket_handler(
	ws: WebSocketUpgrade,
	db_pool: DatabasePool,
	lobby_pool: LobbyPool,
) -> impl IntoResponse {
	ws.on_upgrade(|socket| handle_socket(socket, db_pool, lobby_pool))
}

fn handle_create_lobby(
	tx: &broadcast::Sender<Message>,
	value: &Value,
	db_pool: &DatabasePool,
	lobby_pool: &LobbyPool,
) {
	let host_id = match value.get("host_id") {
		Some(v) => v.as_str().unwrap(),
		None => {
			let response = json!({
				"op_code": OpCode::ERROR,
				"value": "\"host_id\" field is missing.".to_string()
			})
			.to_string();
			let _ = tx.send(Message::Text(response));
			return;
		}
	};

	let res = lobby_pool.create_lobby(host_id, tx.clone(), db_pool);
	match res {
		Ok(ok) => {
			let response = json!({
				"op_code": OpCode::OK,
				"for": OpCode::CREATE_LOBBY,
				"value": ok
			})
			.to_string();
			let _ = tx.send(Message::Text(response));
		}
		Err(err) => {
			let response = json!({
				"op_code": OpCode::ERROR,
				"value": err
			})
			.to_string();
			let _ = tx.send(Message::Text(response));
		}
	};
}

fn handle_join_lobby(
	tx: &broadcast::Sender<Message>,
	value: &Value,
	db_pool: &DatabasePool,
	lobby_pool: &LobbyPool,
) {
	let lobby_id = match value.get("lobby_id") {
		Some(v) => v.as_str().unwrap(),
		None => {
			let response = json!({
				"op_code": OpCode::ERROR,
				"value": "\"lobby_id\" field is missing.".to_string()
			})
			.to_string();
			let _ = tx.send(Message::Text(response));
			return;
		}
	};

	let user_id = match value.get("user_id") {
		Some(v) => v.as_str().unwrap(),
		None => {
			let response = json!({
				"op_code": OpCode::ERROR,
				"value": "\"user_id\" field is missing.".to_string()
			})
			.to_string();
			let _ = tx.send(Message::Text(response));
			return;
		}
	};

	let res = lobby_pool.join_lobby(lobby_id, user_id, tx.clone(), db_pool);
	match res {
		Ok(ok) => {
			let response = json!({
				"op_code": OpCode::OK,
				"for": OpCode::JOIN_LOBBY,
				"value": ok
			})
			.to_string();
			let _ = tx.send(Message::Text(response));
		}
		Err(err) => {
			let response = json!({
				"op_code": OpCode::ERROR,
				"value": err
			})
			.to_string();
			let _ = tx.send(Message::Text(response));
		}
	};
}

fn handle_message(
	tx: &broadcast::Sender<Message>,
	value: &Value,
	db_pool: &DatabasePool,
	lobby_pool: &LobbyPool,
) {
	let lobby_id = match value.get("lobby_id") {
		Some(v) => v.as_str().unwrap(),
		None => {
			let response = json!({
				"op_code": OpCode::ERROR,
				"value": "\"lobby_id\" field is missing.".to_string()
			})
			.to_string();
			let _ = tx.send(Message::Text(response));
			return;
		}
	};

	let user_id = match value.get("user_id") {
		Some(v) => v.as_str().unwrap(),
		None => {
			let response = json!({
				"op_code": OpCode::ERROR,
				"value": "\"user_id\" field is missing.".to_string()
			})
			.to_string();
			let _ = tx.send(Message::Text(response));
			return;
		}
	};

	let message = match value.get("message") {
		Some(v) => v.as_str().unwrap(),
		None => {
			let response = json!({
				"op_code": OpCode::ERROR,
				"value": "\"message\" field is missing.".to_string()
			})
			.to_string();
			let _ = tx.send(Message::Text(response));
			return;
		}
	};

	let lobby = match lobby_pool.get(lobby_id) {
		Some(lobby) => lobby,
		None => {
			let response = json!({
				"op_code": OpCode::ERROR,
				"value": format!("Invalid lobby id: {}", lobby_id)
			})
			.to_string();
			let _ = tx.send(Message::Text(response));
			return;
		}
	};

	if !user_exists(user_id, db_pool) {
		let response = json!({
			"op_code": OpCode::ERROR,
			"value": format!("Invalid user id: {}", user_id)
		})
		.to_string();
		let _ = tx.send(Message::Text(response));
		return;
	}

	for (client_id, client_conn) in lobby.clients.iter() {
		if user_id == client_id {
			continue;
		}
		let inner = json!({
			"from": user_id.to_string(),
			"message": message.to_string()
		});
		let response = json!({
			"op_code": OpCode::MESSAGE,
			"for": OpCode::MESSAGE,
			"value": inner
		})
		.to_string();
		let _ = client_conn.send(Message::Text(response));
	}
}

fn handle_get_lobby_ids(
	tx: &broadcast::Sender<Message>,
	lobby_pool: &LobbyPool
) {
	let ids = lobby_pool.get_ids();
	let response = json!({
		"op_code": OpCode::OK,
		"for": OpCode::GET_LOBBY_IDS,
		"ids": ids
	}).to_string();
	let _ = tx.send(Message::Text(response));
}

pub async fn handle_socket(
	socket: WebSocket,
	db_pool: DatabasePool,
	lobby_pool: LobbyPool
) {
	let (mut sender, mut receiver) = socket.split();
	let (tx, mut rx) = broadcast::channel(100);

	// Receiving msg through sockets
	tokio::spawn(async move {
		while let Some(Ok(message)) = receiver.next().await {
			if let Message::Text(text) = message {
				let payload: SocketPayload = serde_json::from_str(&text).unwrap();
				match payload.op_code {
					OpCode::CREATE_LOBBY => {
						handle_create_lobby(&tx, &payload.value, &db_pool, &lobby_pool)
					}
					OpCode::JOIN_LOBBY => {
						handle_join_lobby(&tx, &payload.value, &db_pool, &lobby_pool)
					}
					OpCode::MESSAGE => handle_message(&tx, &payload.value, &db_pool, &lobby_pool),
					OpCode::GET_LOBBY_IDS => handle_get_lobby_ids(&tx, &lobby_pool),
					_ => ()
				};
			}
		}
	});

	// Sending msg through sockets
	tokio::spawn(async move {
		while let Ok(msg) = rx.recv().await {
			if sender.send(msg).await.is_err() {
				break;
			}
		}
	});
}
