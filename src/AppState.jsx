import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { WS_SERVER_IP, OpCode, MPState, wsSend } from "./const.jsx";

const AppStateContext = createContext(null);

// Load from session storage
const loadInitialAppState = () => {
	const savedState = sessionStorage.getItem("appState");
	return savedState
		? JSON.parse(savedState)
		: {
				user_id: "",
				lobby_id: "",
				in_lobby: false,
			};
};

const loadInitialMusicState = () => {
	const savedState = sessionStorage.getItem("musicState");
	return savedState
		? JSON.parse(savedState)
		: {
				id: "",
				title: "",
				artist: "",
				cover_img: "",
				state: MPState.PAUSE,
				has_item: false,
			};
};

export const AppStateProvider = ({ children }) => {
	const ws = useRef(null);
	const msgHandlers = useRef({});
	const audioRef =useRef(null);
	const [appState, setAppState] = useState(loadInitialAppState);
	const [musicState, setMusicState] = useState(loadInitialMusicState);

	const updateLobbyState = (lobby_id, in_lobby) => {
		setAppState(prevState => {
			const newState = {
				...prevState,
				lobby_id: lobby_id,
				in_lobby: in_lobby,
			};
			sessionStorage.setItem(
				"appState",
				JSON.stringify(newState)
			);
			return newState;
		});
	};

	const updateMusicData = (id, title, artist, cover_img, state) => {
		setMusicState(prevState => {
			const newMusicState = {
				id: id,
				title: title,
				artist: artist,
				cover_img: cover_img,
				state: state,
				has_item: (id.length === 0) ? false : true,
			};
			sessionStorage.setItem(
				"musicState",
				JSON.stringify(newMusicState)
			);
			return newMusicState;
		});
	}

	const updateMusicState = (state) => {
		setMusicState(prevState => {
			const newMusicState = {
				...prevState,
				state: state,
			};
			sessionStorage.setItem(
				"musicState",
				JSON.stringify(newMusicState)
			);
			return newMusicState;
		});
	}

	const updateUserId = (user_id) => {
		setAppState(prevState => {
			const newState = {
				...prevState,
				user_id: user_id,
			};
			sessionStorage.setItem(
				"appState",
				JSON.stringify(newState)
			);
			return newState;
		});
	};

	const addMsgHandler = (tag, handler) => {
		msgHandlers.current[tag] = handler;
	}

	useEffect(() => {
		ws.current = new WebSocket(WS_SERVER_IP);
		console.log("New websocket");

		ws.current.onopen = () => {
			console.log("From Handler: Connection Open");
		}

		ws.current.onmessage = (event) => {
			let res = JSON.parse(event.data);
			if (res.op_code == OpCode.ERROR) {
				console.log(res.value);
				return;
			}

			let found = false;
			if (res.for in msgHandlers.current) {
				msgHandlers.current[res.for](res);
				found = true;
			}

			if (!found) {
				console.log("From Handler:", event.data);
			}
		}

		ws.current.onclose = () => {
			console.log("From Handler: Connection Closed");
		}

		return () => {
			if (ws.current && ws.current.readyState == WebSocket.OPEN) {
				ws.current.close();
			}
		}
	}, []);

	return (
		<AppStateContext.Provider value={{
			appState,
			musicState,
			ws,
			audioRef,
			updateLobbyState,
			updateMusicData,
			updateMusicState,
			addMsgHandler,
			updateUserId
		}}>
			{children}
		</AppStateContext.Provider>
	);
};

export const useAppState = () => useContext(AppStateContext);
