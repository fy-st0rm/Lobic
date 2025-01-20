// Node modules
import React, { FC, createContext, useContext, useState } from "react";

/*
 * LobbyState type
 * @member {string | null} lobby_id - Holds the currently joined lobby id
 * @member {boolean} in_lobby - Indicates if the user is in lobby or not
 * @member {boolean} is_host - Indicates if the user is the host of the lobby or not
 */

export type LobbyState = {
	lobby_id: string | null;
	in_lobby: boolean;
	is_host: boolean;
};

/*
 * LobbyProvider Context type
 * @member {LobbyState} lobbyState - Provides the lobby state
 * @member {function} updateLobbyState - Provides setter for lobby state
 */

export type LobbyContextType = {
	lobbyState: LobbyState;
	updateLobbyState: (state: Partial<LobbyState>) => void;
};

// Creating context width default values will be assigned later in providers
const defaultContext: LobbyContextType = {
	lobbyState: {
		lobby_id: null,
		in_lobby: false,
		is_host: false,
	},
	updateLobbyState: () => {},
};

const LobbyContext = createContext<LobbyContextType>(defaultContext);

/*
 * Loads LobbyState from session storage
 * @returns {LobbyState} - The loaded lobby state
 */

const loadLobbyState = (): LobbyState => {
	const savedState = sessionStorage.getItem("LobbyState");
	return savedState
		? JSON.parse(savedState)
		: {
				lobby_id: null,
				in_lobby: false,
				is_host: false,
			};
};

export const LobbyProvider: FC<{ children: React.ReactNode }> = ({
	children,
}): React.ReactElement => {
	const [lobbyState, setLobbyState] = useState<LobbyState>(loadLobbyState);

	const updateLobbyState = (state: Partial<LobbyState>) => {
		setLobbyState((prevState) => {
			const newState: LobbyState = {
				...prevState,
				...state,
			};
			sessionStorage.setItem("LobbyState", JSON.stringify(newState));
			return newState;
		});
	};

	return (
		<LobbyContext.Provider value={{ lobbyState, updateLobbyState }}>
			{children}
		</LobbyContext.Provider>
	);
};

export const useLobbyProvider = () => useContext(LobbyContext);
