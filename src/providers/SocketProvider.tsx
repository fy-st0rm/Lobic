// Node modules
import React, {
	FC,
	createContext,
	useContext,
	useRef,
	useState,
	useEffect,
} from "react";

// Local
import { useAppProvider } from "providers/AppProvider.tsx";
import { OpCode, SocketResponse, wsSend } from "api/socketApi.ts";
import { WS_SERVER_IP } from "@/const.ts";

/*
 * Types that defines the message handlers
 */

type MsgHandler = (response: SocketResponse) => void;
type MsgHandlers = {
	[id in OpCode]: MsgHandler;
};

/*
 * SocketContext Type
 * @member {function} getSocket - Returns the websocket instance
 * @member {function} addMsgHandler - Inserts a new message handler into the system
 */

export type SocketContextType = {
	getSocket: () => WebSocket | null;
	addMsgHandler: (tag: OpCode, handler: MsgHandler) => void;
};

// Creating context width default values will be assigned later in providers
const defaultContext: SocketContextType = {
	getSocket: () => null,
	addMsgHandler: () => {},
};

const SocketContext = createContext<SocketContextType>(defaultContext);

export const SocketProvider: FC<{ children: React.ReactNode }> = ({
	children,
}): React.ReactElement => {
	const ws = useRef<WebSocket>(new WebSocket(WS_SERVER_IP));
	const msgHandlers = useRef<MsgHandlers>({} as MsgHandlers);

	const { appState } = useAppProvider();

	const getSocket = (): WebSocket | null => {
		return ws.current;
	};

	const addMsgHandler = (tag: OpCode, handler: MsgHandler) => {
		msgHandlers.current[tag] = handler;
	};

	useEffect(() => {
		ws.current.onopen = () => {
			console.log("From Handler: Connection Open");

			// Performs connection whenever the page is refreshed and when userid exists
			if (appState.user_id !== null) {
				const payload = {
					op_code: OpCode.CONNECT,
					value: {
						user_id: appState.user_id,
					},
				};
				wsSend(ws.current, payload);
			}
		};

		ws.current.onmessage = (event: MessageEvent) => {
			let res = JSON.parse(event.data) as SocketResponse;
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
			if (ws.current && ws.current.readyState === WebSocket.OPEN) {
				ws.current.close();
			}
		};
	}, []);

	return (
		<SocketContext.Provider value={{ getSocket, addMsgHandler }}>
			{children}
		</SocketContext.Provider>
	);
};

export const useSocketProvider = () => useContext(SocketContext);
