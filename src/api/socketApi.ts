import React from "react";

export enum OpCode {
	OK = "OK",
	ERROR = "ERROR",
	CONNECT = "CONNECT",
	CREATE_LOBBY = "CREATE_LOBBY",
	JOIN_LOBBY = "JOIN_LOBBY",
	LEAVE_LOBBY = "LEAVE_LOBBY",
	DELETE_LOBBY = "DELETE_LOBBY",
	GET_LOBBY_IDS = "GET_LOBBY_IDS",
	GET_LOBBY_MEMBERS = "GET_LOBBY_MEMBERS",
	MESSAGE = "MESSAGE",
	GET_MESSAGES = "GET_MESSAGES",
	SET_MUSIC_STATE = "SET_MUSIC_STATE",
	SYNC_MUSIC = "SYNC_MUSIC",
	SET_QUEUE = "SET_QUEUE",
	SYNC_QUEUE = "SYNC_QUEUE",
	ADD_FRIEND = "ADD_FRIEND",
	REMOVE_FRIEND = "REMOVE_FRIEND",
	NOTIFICATION = "NOTIFICATION",
	REQUEST_MUSIC_PLAY = "REQUEST_MUSIC_PLAY",
}

export type SocketResponse = {
	op_code: OpCode;
	for: OpCode;
	value: any; // TODO: Maybe add union of types
};

export type SocketPayload = {
	op_code: OpCode;
	value: any; // TODO: Maybe add union of types
};

/*
 * Sends the websocket request to the server.
 * @param {WebSocket} ws - WebSocket hanlder
 * @param {SocketPayload} data - Payload to transfer
 */

export const wsSend = (ws: WebSocket | null, data: SocketPayload) => {
	if (ws === null) {
		console.log("Websocket is null");
		return;
	}
	if (ws.readyState === WebSocket.OPEN) {
		ws.send(JSON.stringify(data));
	}
};
