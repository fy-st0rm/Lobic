import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { WS_SERVER_IP, OpCode, wsSend } from "./const.jsx";

const AppStateContext = createContext(null);

// Load from session storage
const loadInitialState = () => {
	const savedState = sessionStorage.getItem("appState");
	return savedState
		? JSON.parse(savedState)
		: {
				user_id: "",
				lobby_id: "",
				in_lobby: false,
			};
};

export const AppStateProvider = ({ children }) => {
	const ws = useRef(null);
	const msgHandlers = useRef({});
	const [appState, setAppState] = useState(loadInitialState);

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
		if (ws.current === null) {
			ws.current = new WebSocket(WS_SERVER_IP);
			console.log("New websocket");
		}

		ws.current.onopen = () => {
			console.log("From Handler: Connection Open");
	
			const payload = {
				op_code: OpCode.CONNECT,
				value: {
					user_id: appState.user_id
				}
			};
			ws.current.send(JSON.stringify(payload));
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

		// Optionally handle WebSocket reconnections on refresh
		if (!ws.current || ws.current.readyState === WebSocket.CLOSED) {
			ws.current = new WebSocket(WS_SERVER_IP);
		}
	}, []);

	return (
		<AppStateContext.Provider value={{
			appState, ws,
			updateLobbyState, addMsgHandler,
			updateUserId
		}}>
			{children}
		</AppStateContext.Provider>
	);
};

export const useAppState = () => useContext(AppStateContext);
