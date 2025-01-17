// Node modules
import React, {
	createContext,
	useContext,
	useRef,
	useState,
	useEffect,
} from "react";

// Locals
import { WS_SERVER_IP, MPState } from "@/const.jsx";
import {
	OpCode,
	wsSend
} from "api/socketApi.ts";

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
				is_host: false,
			};
};

const loadInitialMusicState = () => {
	const savedState = sessionStorage.getItem("musicState");
	return savedState
		? JSON.parse(savedState)
		: {
				has_item: false,
				id: "",
				title: "",
				artist: "",
				cover_img: "",

				timestamp: 0,
				duration: 0,
				volume: 50,

				state: MPState.PAUSE,
				state_data: 0,
			};
};

//TODO: Improve update state functions

export const AppStateProvider = ({ children }) => {
	const ws = useRef(null);
	const msgHandlers = useRef({});
	const audioRef = useRef(null);
	const [appState, setAppState] = useState(loadInitialAppState);
	const [musicState, setMusicState] = useState(loadInitialMusicState);
	const [controlsDisabled, setControlsDisabled] = useState(true);

	const updateAppState = (state) => {
		setAppState((prevState) => {
			const newState = {
				...prevState,
				...state,
			};
			sessionStorage.setItem("appState", JSON.stringify(newState));
			return newState;
		});
	}

	const updateMusicState = (state) => {
		setMusicState((prevState) => {
			const newState = {
				...prevState,
				...state,
			};
			sessionStorage.setItem("musicState", JSON.stringify(newState));
			return newState;
		});
	}

	const addMsgHandler = (tag, handler) => {
		msgHandlers.current[tag] = handler;
	};

	useEffect(() => {
		ws.current = new WebSocket(WS_SERVER_IP);
		console.log("New websocket");

		ws.current.onopen = () => {
			console.log("From Handler: Connection Open");

			// Performs connection whenever the page is refreshed and when userid exists
			if (appState.user_id !== "") {
				const payload = {
					op_code: OpCode.CONNECT,
					value: {
						user_id: appState.user_id,
					},
				};
				wsSend(ws, payload);
			}
		};

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
		};

		ws.current.onclose = () => {
			console.log("From Handler: Connection Closed");
		};

		return () => {
			if (ws.current && ws.current.readyState == WebSocket.OPEN) {
				ws.current.close();
			}
		};
	}, []);

	return (
		<AppStateContext.Provider
			value={{
				ws,
				audioRef,
				appState,
				musicState,
				controlsDisabled,
				addMsgHandler,
				updateAppState,
				updateMusicState,
				setControlsDisabled,
			}}
		>
			{children}
		</AppStateContext.Provider>
	);
};

export const useAppState = () => useContext(AppStateContext);
