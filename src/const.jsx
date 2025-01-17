export const SERVER_IP = "http://127.0.0.1:8080";
export const WS_SERVER_IP = "ws://127.0.0.1:8080/ws";

// export const OpCode = Object.freeze({
// 	OK: "OK",
// 	ERROR: "ERROR",
// 	CONNECT: "CONNECT",
// 	CREATE_LOBBY: "CREATE_LOBBY",
// 	JOIN_LOBBY: "JOIN_LOBBY",
// 	LEAVE_LOBBY: "LEAVE_LOBBY",
// 	DELETE_LOBBY: "DELETE_LOBBY",
// 	MESSAGE: "MESSAGE",
// 	GET_MESSAGES: "GET_MESSAGES",
// 	GET_LOBBY_IDS: "GET_LOBBY_IDS",
// 	SET_MUSIC_STATE: "SET_MUSIC_STATE",
// 	SYNC_MUSIC: "SYNC_MUSIC",
// 	ADD_FRIEND: "ADD_FRIEND",
// 	REMOVE_FRIEND: "REMOVE_FRIEND",
// });

export const MPState = Object.freeze({
	PLAY: "PLAY",
	PAUSE: "PAUSE",
	CHANGE_MUSIC: "CHANGE_MUSIC",
	CHANGE_VOLUME: "CHANGE_VOLUME",
	CHANGE_TIME: "CHANGE_TIME",
});

// Creates a blob url for audio
export const fetchMusicUrl = async (id) => {
	try {
		const url = `${SERVER_IP}/music/${encodeURIComponent(id)}`;
		const response = await fetch(url, {
			method: "GET",
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const blob = await response.blob();
		const audioUrl = URL.createObjectURL(blob);
		return audioUrl;
	} catch (error) {
		console.error("Failed to fetch music:", error);
		throw error;
	}
};
