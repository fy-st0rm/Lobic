import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { WS_SERVER_IP, OpCode } from "./const.jsx";

const AppStateContext = createContext(null);

// Load from localstorage
const loadInitialState = () => {
	const savedState = localStorage.getItem("appState");
	return savedState
		? JSON.parse(savedState)
		: {
				lobby_id: "",
				in_lobby: false,
			};
};

export const AppStateProvider = ({ children }) => {
	const ws = useRef(new WebSocket(WS_SERVER_IP));
	const msgHandlers = useRef({});
	const [appState, setAppState] = useState(loadInitialState);

	const updateLobbyState = (lobby_id, in_lobby) => {
		setAppState(prevState => {
			const newState = {
				...prevState,
				lobby_id,
				in_lobby
			};
			localStorage.setItem(
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
		ws.current.onopen = () => {
			console.log("From Handler: Connection Open");
		}

		ws.current.onmessage = (event) => {
			console.log("From Handler:", event.data);

			let res = JSON.parse(event.data);
			if (res.op_code == OpCode.ERROR) {
				console.log(res.value);
				return;
			}

			if (res.for in msgHandlers.current) {
				msgHandlers.current[res.for](res);
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
		<AppStateContext.Provider value={{appState, ws, updateLobbyState, addMsgHandler}}>
			{children}
		</AppStateContext.Provider>
	);
};

export const useAppState = () => useContext(AppStateContext);
