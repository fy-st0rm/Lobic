import React from "react";

export enum OpCode {
	OK = "OK",
	ERROR = "ERROR",
	CONNECT = "CONNECT",
	CREATE_LOBBY = "CREATE_LOBBY",
	JOIN_LOBBY = "JOIN_LOBBY",
	LEAVE_LOBBY = "LEAVE_LOBBY",
	DELETE_LOBBY = "DELETE_LOBBY",
	MESSAGE = "MESSAGE",
	GET_MESSAGES = "GET_MESSAGES",
	GET_LOBBY_IDS = "GET_LOBBY_IDS",
	SET_MUSIC_STATE = "SET_MUSIC_STATE",
	SYNC_MUSIC = "SYNC_MUSIC",
	ADD_FRIEND = "ADD_FRIEND",
	REMOVE_FRIEND = "REMOVE_FRIEND",
};

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

export const wsSend = (
	ws: React.RefObject<WebSocket | null>,
	data: SocketPayload
) => {
	if (ws.current === null) {
		console.log("Websocket is null");
		return;
	}
	if (ws.current.readyState === WebSocket.OPEN) {
		ws.current.send(JSON.stringify(data));
	}
}

