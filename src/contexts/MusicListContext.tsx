import React, { createContext, useContext, useCallback, useState } from "react";

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
}

const MusicListsContext = createContext<MusicListsContextType | undefined>(
	undefined,
);

export const MusicListsProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	// Store reload handlers for each list type
	const [reloadHandlers] = useState<Map<ListType, Set<() => void>>>(new Map());

	const registerReloadHandler = useCallback(
		(listType: ListType, handler: () => void) => {
			if (!reloadHandlers.has(listType)) {
				reloadHandlers.set(listType, new Set());
			}
			reloadHandlers.get(listType)?.add(handler);

			// Return cleanup function
			return () => {
				reloadHandlers.get(listType)?.delete(handler);
			};
		},
		[reloadHandlers],
	);

	const notifyMusicPlayed = useCallback(
		(songId: string, sourceList?: ListType) => {
			// Always reload Recently Played list when any song is played
			reloadHandlers.get("Recently Played")?.forEach((handler) => handler());
			// Always reload My Top Tracks list when any song is played

			reloadHandlers.get("My Top Tracks")?.forEach((handler) => handler());

			reloadHandlers.get("Liked Songs")?.forEach((handler) => handler());
		},
		[reloadHandlers],
	);

	return (
		<MusicListsContext.Provider
			value={{ notifyMusicPlayed, registerReloadHandler }}
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
