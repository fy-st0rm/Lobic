use crate::app_state::AppState;
use crate::config::OpCode;
use crate::lobby::*;
use crate::lobic_db::db::*;
use crate::user_pool::UserPool;

use axum::{
	extract::ws::{Message, WebSocket, WebSocketUpgrade},
	extract::State,
	response::IntoResponse,
};
use futures::{sink::SinkExt, stream::StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tokio::sync::broadcast;

#[derive(Debug, Serialize, Deserialize)]
struct SocketPayload {
	pub op_code: OpCode,
	pub value: Value,
}

pub async fn websocket_handler(
	ws: WebSocketUpgrade,
	State(app_state): State<AppState>,
) -> impl IntoResponse {
	ws.on_upgrade(|socket| handle_socket(socket, State(app_state)))
}

fn handle_connect(tx: &broadcast::Sender<Message>, value: &Value, user_pool: &UserPool) {
	let user_id = match value.get("user_id") {
		Some(id) => id.as_str().unwrap(),
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

	let response = json!({
		"op_code": OpCode::OK,
		"for": OpCode::CONNECT,
		"value": "Sucessfully connected to ws."
	})
	.to_string();
	let _ = tx.send(Message::Text(response));

	user_pool.insert(user_id, tx);
}

fn handle_create_lobby(
	tx: &broadcast::Sender<Message>,
	value: &Value,
	db_pool: &DatabasePool,
	lobby_pool: &LobbyPool,
	user_pool: &UserPool,
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

	let res = lobby_pool.create_lobby(host_id, db_pool);
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

	// TODO: Broadcast to friends only
	// Broadcasting to every clients
	let conns = user_pool.get_conns();
	for conn in conns {
		handle_get_lobby_ids(&conn, lobby_pool);
	}
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

	let res = lobby_pool.join_lobby(lobby_id, user_id, db_pool);
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

fn handle_leave_lobby(
	tx: &broadcast::Sender<Message>,
	value: &Value,
	db_pool: &DatabasePool,
	lobby_pool: &LobbyPool,
	user_pool: &UserPool,
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

	let res: Result<String, String>;
	if lobby.host_id == user_id {
		res = lobby_pool.delete_lobby(lobby_id, user_pool);

		let conns = user_pool.get_conns();
		for conn in conns {
			handle_get_lobby_ids(&conn, lobby_pool);
		}
	} else {
		res = lobby_pool.leave_lobby(lobby_id, user_id, db_pool);
	}

	match res {
		Ok(ok) => {
			let response = json!({
				"op_code": OpCode::OK,
				"for": OpCode::LEAVE_LOBBY,
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
	user_pool: &UserPool,
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

	match lobby_pool.append_message(lobby_id, user_id, message, db_pool) {
		Ok(_) => (),
		Err(e) => {
			let response = json!({
				"op_code": OpCode::ERROR,
				"value": e,
			})
			.to_string();
			let _ = tx.send(Message::Text(response));
			return;
		}
	};

	let lobby = lobby_pool.get(lobby_id).unwrap();
	let msgs = lobby.chat;

	for client_id in lobby.clients {
		let response = json!({
			"op_code": OpCode::OK,
			"for": OpCode::GET_MESSAGES,
			"value": msgs
		})
		.to_string();

		let client_conn = match user_pool.get(&client_id) {
			Some(conn) => conn,
			None => {
				let response = json!({
					"op_code": OpCode::ERROR,
					"value": format!("Cannot find user {} in a lobby {} (in \"handle_message\" this shouldnt occure)", client_id, lobby_id)
				}).to_string();
				let _ = tx.send(Message::Text(response));
				return;
			}
		};
		let _ = client_conn.send(Message::Text(response));
	}
}

fn handle_get_messages(tx: &broadcast::Sender<Message>, value: &Value, lobby_pool: &LobbyPool) {
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

	let msgs = match lobby_pool.get_msgs(lobby_id) {
		Some(msgs) => msgs,
		None => {
			let response = json!({
				"op_code": OpCode::ERROR,
				"value": format!("Invalid lobby id: {}", lobby_id),
			})
			.to_string();
			let _ = tx.send(Message::Text(response));
			return;
		}
	};

	let response = json!({
		"op_code": OpCode::OK,
		"for": OpCode::GET_MESSAGES,
		"value": msgs
	})
	.to_string();
	let _ = tx.send(Message::Text(response));
}

fn handle_get_lobby_ids(tx: &broadcast::Sender<Message>, lobby_pool: &LobbyPool) {
	let ids = lobby_pool.get_ids();
	let response = json!({
		"op_code": OpCode::OK,
		"for": OpCode::GET_LOBBY_IDS,
		"value": ids
	})
	.to_string();
	let _ = tx.send(Message::Text(response));
}

pub async fn handle_socket(socket: WebSocket, State(app_state): State<AppState>) {
	let (mut sender, mut receiver) = socket.split();
	let (tx, mut rx) = broadcast::channel(100);

	let db_pool = app_state.db_pool;
	let lobby_pool = app_state.lobby_pool;
	let user_pool = app_state.user_pool;

	// Receiving msg through sockets
	tokio::spawn(async move {
		while let Some(Ok(message)) = receiver.next().await {
			if let Message::Text(text) = message {
				let payload: SocketPayload = match serde_json::from_str(&text) {
					Ok(value) => value,
					Err(err) => {
						let response = json!({
							"op_code": OpCode::ERROR,
							"value": err.to_string()
						})
						.to_string();
						let _ = tx.send(Message::Text(response));
						return;
					}
				};

				match payload.op_code {
					OpCode::CONNECT => handle_connect(&tx, &payload.value, &user_pool),
					OpCode::CREATE_LOBBY => {
						handle_create_lobby(&tx, &payload.value, &db_pool, &lobby_pool, &user_pool)
					}
					OpCode::JOIN_LOBBY => {
						handle_join_lobby(&tx, &payload.value, &db_pool, &lobby_pool)
					}
					OpCode::LEAVE_LOBBY => {
						handle_leave_lobby(&tx, &payload.value, &db_pool, &lobby_pool, &user_pool)
					}
					OpCode::MESSAGE => {
						handle_message(&tx, &payload.value, &db_pool, &lobby_pool, &user_pool)
					}
					OpCode::GET_MESSAGES => handle_get_messages(&tx, &payload.value, &lobby_pool),
					OpCode::GET_LOBBY_IDS => handle_get_lobby_ids(&tx, &lobby_pool),
					_ => (),
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
