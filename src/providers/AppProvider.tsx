// Node modules
import React, { FC, createContext, useContext, useState } from "react";

/*
 * AppState type
 * @member {string | null} user_id - Id of the current user
 */

export type AppState = {
	user_id: string;
};

/*
 * AppProvider Context type
 * @member {AppState} appState - Provides the app state
 * @member {function} updateAppState - Provides setter for app state
 */

export type AppContextType = {
	appState: AppState;
	updateAppState: (state: Partial<AppState>) => void;
};

// Creating context width default values will be assigned later in providers
const defaultContext: AppContextType = {
	appState: { user_id: "" },
	updateAppState: (state: Partial<AppState>) => {},
};

const AppContext = createContext<AppContextType>(defaultContext);

/*
 * Loads AppState from session storage
 * @returns {AppState} - The loaded appstate
 */

const loadAppState = (): AppState => {
	const savedState = sessionStorage.getItem("AppState");
	return savedState
		? JSON.parse(savedState)
		: {
				user_id: null,
			};
};

export const AppProvider: FC<{ children: React.ReactNode }> = ({
	children,
}): React.ReactElement => {
	const [appState, setAppState] = useState<AppState>(loadAppState);

	const updateAppState = (state: Partial<AppState>) => {
		setAppState((prevState) => {
			const newState: AppState = {
				...prevState,
				...state,
			};
			sessionStorage.setItem("AppState", JSON.stringify(newState));
			return newState;
		});
	};

	return (
		<AppContext.Provider value={{ appState, updateAppState }}>
			{children}
		</AppContext.Provider>
	);
};

export const useAppProvider = () => useContext(AppContext);
