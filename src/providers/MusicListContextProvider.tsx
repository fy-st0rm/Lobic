import React, {
	createContext,
	useContext,
	useCallback,
	useReducer,
	useEffect,
	useState,
} from "react";
import { fetchUserPlaylists, Playlist } from "@/api/playlist/playlistApi";
import { useAppProvider } from "providers/AppProvider";

type ListType =
	| "Liked Songs"
	| "Featured Music"
	| "Recently Played"
	| "Trending Now"
	| "My Top Tracks";

interface MusicListsContextType {
	notifyMusicPlayed: (songId: string, listType?: ListType) => void;
	registerReloadHandler: (
		listType: ListType,
		handler: () => void,
	) => () => void;
	playlists: Playlist[];
	refreshPlaylists: () => Promise<void>;
}

const MusicListsContext = createContext<MusicListsContextType | undefined>(
	undefined,
);

type State = Map<ListType, Set<() => void>>;

type Action =
	| { type: "REGISTER_HANDLER"; listType: ListType; handler: () => void }
	| { type: "UNREGISTER_HANDLER"; listType: ListType; handler: () => void }
	| { type: "NOTIFY_PLAYED"; songId: string; sourceList?: ListType };

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case "REGISTER_HANDLER":
			const handlers = state.get(action.listType) || new Set();
			handlers.add(action.handler);
			state.set(action.listType, handlers);
			return new Map(state);
		case "UNREGISTER_HANDLER":
			const existingHandlers = state.get(action.listType);
			if (existingHandlers) {
				existingHandlers.delete(action.handler);
				if (existingHandlers.size === 0) {
					state.delete(action.listType);
				} else {
					state.set(action.listType, existingHandlers);
				}
			}
			return new Map(state);
		case "NOTIFY_PLAYED":
			// Always reload Recently Played and My Top Tracks lists when any song is played
			(
				["Recently Played", "My Top Tracks", "Liked Songs"] as ListType[]
			).forEach((listType) => {
				state.get(listType)?.forEach((handler) => handler());
			});
			return state;
		default:
			return state;
	}
}

export const MusicListsProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [reloadHandlers, dispatch] = useReducer(reducer, new Map());
	const [playlists, setPlaylists] = useState<Playlist[]>([]);
	const { appState } = useAppProvider();
	const userId = appState.user_id;

	const refreshPlaylists = useCallback(async () => {
		if (!userId) return;

		try {
			const response = await fetchUserPlaylists(userId);
			setPlaylists(response.playlists);
		} catch (error) {
			console.error("Error fetching playlists:", error);
		}
	}, [userId]);

	useEffect(() => {
		if (userId) {
			refreshPlaylists();
		}
	}, [userId, refreshPlaylists]);

	const registerReloadHandler = useCallback(
		(listType: ListType, handler: () => void) => {
			dispatch({ type: "REGISTER_HANDLER", listType, handler });
			return () => {
				dispatch({ type: "UNREGISTER_HANDLER", listType, handler });
			};
		},
		[],
	);

	const notifyMusicPlayed = useCallback(
		(songId: string, sourceList?: ListType) => {
			dispatch({ type: "NOTIFY_PLAYED", songId, sourceList });
		},
		[],
	);

	return (
		<MusicListsContext.Provider
			value={{
				notifyMusicPlayed,
				registerReloadHandler,
				playlists,
				refreshPlaylists,
			}}
		>
			{children}
		</MusicListsContext.Provider>
	);
};

export const useMusicLists = () => {
	const context = useContext(MusicListsContext);
	if (!context) {
		throw new Error("useMusicLists must be used within a MusicListsProvider");
	}
	return context;
};
