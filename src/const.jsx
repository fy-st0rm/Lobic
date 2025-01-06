export const SERVER_IP = "http://127.0.0.1:8080";
export const WS_SERVER_IP = "ws://127.0.0.1:8080/ws";

export const OpCode = Object.freeze({
	OK: "OK",
	ERROR: "ERROR",
	CONNECT: "CONNECT",
	CREATE_LOBBY: "CREATE_LOBBY",
	JOIN_LOBBY: "JOIN_LOBBY",
	LEAVE_LOBBY: "LEAVE_LOBBY",
	DELETE_LOBBY: "DELETE_LOBBY",
	MESSAGE: "MESSAGE",
	GET_MESSAGES: "GET_MESSAGES",
	GET_LOBBY_IDS: "GET_LOBBY_IDS",
});

export const MPState = Object.freeze({
	PLAYING: "PLAYING",
	CHANGE: "CHANGE",
	PAUSE: "PAUSE",
});

export const wsSend = (ws, data) => {
	if (ws.current === null) {
		console.log("Websocket is null");
		return;
	}
	if (ws.current.readyState === WebSocket.OPEN) {
		ws.current.send(JSON.stringify(data));
	}
}
