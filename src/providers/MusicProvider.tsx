// Node modules
import React, { FC, createContext, useContext, useState, useRef } from "react";

// Local
import { MPState } from "@/api/music/musicApi";

/*
 * MusicState type
 * @member {string | null} id - Holds the unique identifier of the current track, or null if no track is selected.
 * @member {string | null} title - The title of the current track, or null if no track is selected.
 * @member {string | null} artist - The artist of the current track, or null if no track is selected.
 * @member {string | null} image_url - The ID of the cover image of the current track, or null if no track is selected.
 * @member {number} timestamp - The current playback position of the track in seconds.
 * @member {number} duration - The total duration of the current track in seconds.
 * @member {number} volume - The current volume level of the music player (range: 0-100).
 * @member {MPState} state - The current playback state of the music player (e.g., playing, paused, stopped).
 * @member {number} state_data - Additional data related to the current playback state.
 */

export type MusicState = {
	id: string | null;
	title: string | null;
	artist: string | null;
	album: string | null;
	image_url: string | null;
	timestamp: number;
	duration: number;
	volume: number;
	state: MPState;
	state_data: number;
};

/*
 * MusicContextType type
 * @member {RefObject<HTMLAudioElement | null> audioRef - Reference to the HTML audio element
 * @member {MusicState} musicState - The current state of the music player, including track info, playback state, etc.
 * @member {boolean} controlsDisabled - Indicates whether the music player controls are disabled or not.
 * @member {function} setControlsDisabled - A function to update the `controlsDisabled` state (true/false).
 * @member {function} updateMusicState - A function to update the `musicState` with partial updates.
 * @member {function} getAudioElement - A function that returns the audio element from audioRef
 */

export type MusicContextType = {
	audioRef: React.RefObject<HTMLAudioElement>;
	musicState: MusicState;
	controlsDisabled: boolean;
	setControlsDisabled: (state: boolean) => void;
	updateMusicState: (state: Partial<MusicState>) => void;
	clearMusicState: () => void;
	getAudioElement: () => HTMLAudioElement | null;
};

// Creating context width default values will be assigned later in providers
const defaultContext: MusicContextType = {
	audioRef: { current: null },
	musicState: {
		id: null,
		title: null,
		artist: null,
		album: null,
		image_url: null,
		timestamp: 0,
		duration: 0,
		volume: 50,
		state: MPState.PAUSE,
		state_data: 0,
	},
	controlsDisabled: false,
	setControlsDisabled: () => {},
	updateMusicState: () => {},
	clearMusicState: () => {},
	getAudioElement: () => null,
};

const MusicContext = createContext<MusicContextType>(defaultContext);

/*
 * Loads the music state from session storage
 * @retuns {MusicState} - Loaded music state
 */

const loadMusicState = (): MusicState => {
	const savedState = sessionStorage.getItem("MusicState");
	return savedState
		? JSON.parse(savedState)
		: {
				id: null,
				title: null,
				artist: null,
				album: null,
				image_url: null,
				timestamp: 0,
				duration: 0,
				volume: 50,
				state: MPState.PAUSE,
				state_data: 0,
			};
};

export const MusicProvider: FC<{ children: React.ReactNode }> = ({
	children,
}): React.ReactElement => {
	const [musicState, setMusicState] = useState<MusicState>(loadMusicState);
	const [controlsDisabled, setControlsDisabled] = useState<boolean>(false);
	const audioRef = useRef<HTMLAudioElement>(null);

	const updateMusicState = (state: Partial<MusicState>) => {
		setMusicState((prevState) => {
			const newState: MusicState = {
				...prevState,
				...state,
			};
			sessionStorage.setItem("MusicState", JSON.stringify(newState));
			return newState;
		});
	};

	const getAudioElement = (): HTMLAudioElement | null => {
		return audioRef.current;
	};

	const clearMusicState = () => {
		updateMusicState({
			id: null,
			title: null,
			artist: null,
			album: null,
			image_url: null,
			timestamp: 0,
			duration: 0,
			volume: 50,
			state: MPState.EMPTY,
			state_data: 0,
		});
	};

	return (
		<MusicContext.Provider
			value={{
				audioRef,
				musicState,
				controlsDisabled,
				setControlsDisabled,
				updateMusicState,
				getAudioElement,
				clearMusicState,
			}}
		>
			{children}
		</MusicContext.Provider>
	);
};

export const useMusicProvider = () => useContext(MusicContext);
