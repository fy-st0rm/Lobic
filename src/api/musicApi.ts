import { SERVER_IP } from "@/const";
import { OpCode, wsSend } from "api/socketApi";
import { AppState } from "providers/AppProvider";
import { LobbyState } from "providers/LobbyProvider";
import { MusicState } from "providers/MusicProvider";

// Enum to define Music Player State
export enum MPState {
	PLAY = "PLAY",
	PAUSE = "PAUSE",
	CHANGE_MUSIC = "CHANGE_MUSIC",
	CHANGE_VOLUME = "CHANGE_VOLUME",
	CHANGE_TIME = "CHANGE_TIME",
	EMPTY = "EMPTY",
}

// Define interfaces for the data structures
export interface MusicTrack {
	id: string;
	title: string;
	artist: string;
	album?: string;
	duration?: number;
	cover_img?: string;
	// Add other fields as needed
}

interface RecentlyPlayedSong extends MusicTrack {
	playedAt: string;
}

/**
 * Fetches a list of music tracks.
 * @returns {Promise<MusicTrack[]>} - A list of music tracks.
 */
export const fetchMusicList = async (
	start_index = 0,
	page_length = 20,
): Promise<MusicTrack[]> => {
	try {
		let url = `${SERVER_IP}/music/get_music`;
		const params = new URLSearchParams({
			page_length: page_length.toString(),
			start_index: start_index.toString(),
		});

		// Append params to URL
		url = `${url}?${params.toString()}`;
		// Fetch the data
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error("Failed to fetch featured music data");
		}

		const data: MusicTrack[] = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching trending songs:", error);
		throw error;
	}
};

/**
 * Fetches a list of trending music tracks.
 * @returns {Promise<MusicTrack[]>} - A list of trending music tracks.
 */
export const fetchTrendingSongs = async (
	start_index = 0,
	page_length = 20,
): Promise<MusicTrack[]> => {
	try {
		let url = `${SERVER_IP}/music/get_trending`;
		const params = new URLSearchParams({
			page_length: page_length.toString(),
			start_index: start_index.toString(),
		});

		// Append params to URL
		url = `${url}?${params.toString()}`;
		// Fetch the data
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error("Failed to fetch trending music data");
		}

		const data: MusicTrack[] = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching trending songs:", error);
		throw error;
	}
};

export const fetchRecentlyPlayed = async (
	userId: string | null,
	start_index = 0,
	page_length = 20,
): Promise<RecentlyPlayedSong[]> => {
	if (!userId) {
		throw new Error("User ID is required to fetch recently played songs");
	}

	try {
		let url = `${SERVER_IP}/music/get_recently_played`;
		const params = new URLSearchParams({
			user_id: userId,
			page_length: page_length.toString(),
			start_index: start_index.toString(),
		});
		url = `${url}?${params.toString()}`;
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error("Failed to fetch recently played songs");
		}

		const data: RecentlyPlayedSong[] = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching recently played songs:", error);
		throw error;
	}
};

/**
 * Logs a song play event for a specific user.
 * @param {string | null} userId - The ID of the user.
 * @param {string} musicId - The ID of the song being played.
 * @returns {Promise<string>} - A confirmation message.
 * @throws {Error} If userId is null
 */
export const logSongPlay = async (
	userId: string | null,
	musicId: string,
): Promise<string> => {
	if (!userId) {
		throw new Error("User ID is required to log song play");
	}

	try {
		const response = await fetch(`${SERVER_IP}/music/log_song_play`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				user_id: userId,
				music_id: musicId,
			}),
		});

		if (!response.ok) {
			throw new Error("Failed to log song play");
		}

		const text: string = await response.text();
		return text;
	} catch (error) {
		console.error("Error logging song play:", error);
		throw error;
	}
};

/**
 * Increments the play count for a specific song.
 * @param {string} songId - The ID of the song.
 * @returns {Promise<string>} - A confirmation message.
 */
export const incrementPlayCount = async (songId: string): Promise<string> => {
	try {
		const response = await fetch(
			`${SERVER_IP}/music/incr_times_played/${songId}`,
			{
				method: "POST",
			},
		);

		if (!response.ok) {
			throw new Error("Failed to increment play count");
		}

		const text: string = await response.text();
		return text;
	} catch (error) {
		console.error("Error incrementing play count:", error);
		throw error;
	}
};

/**
 * Gets the URL for a music image.
 * @param {string} songId - The ID of the song.
 * @returns {string} - The URL of the music image.
 */
export const getMusicImageUrl = (songId: string): string =>
	`${SERVER_IP}/image/${songId}`;

/**
 * Fetches the music from the backend based on the given music id
 * @param {string|null} id - The ID of the music
 * @returns {Promise<string>} - The blob URL of the music
 * @throws {Error} If id is null
 */
export const fetchMusicUrl = async (id: string | null): Promise<string> => {
	if (!id) {
		throw new Error("Music ID is required to fetch music URL");
	}

	try {
		const url = `${SERVER_IP}/music/${encodeURIComponent(id)}`;
		const response = await fetch(url, {
			method: "GET",
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const blob = await response.blob();
		const audioUrl = URL.createObjectURL(blob);
		return audioUrl;
	} catch (error) {
		console.error("Failed to fetch music:", error);
		throw error;
	}
};

/*
 * Updates the host music state in the server
 * @param {WebSocket} socket - Instance of the websocket
 * @param {AppState} appState - Instance of the app state
 * @param {LobbyState} lobbyState - Instance of the lobby state
 * @param {MusicState} musicState - Instance of the music state
 */
export const updateHostMusicState = (
	socket: WebSocket | null,
	appState: AppState,
	lobbyState: LobbyState,
	musicState: MusicState,
) => {
	if (!lobbyState.in_lobby) return;
	if (!musicState.id) return;

	const payload = {
		op_code: OpCode.SET_MUSIC_STATE,
		value: {
			lobby_id: lobbyState.lobby_id,
			user_id: appState.user_id,
			music_id: musicState.id,
			title: musicState.title,
			artist: musicState.artist,
			cover_img: musicState.cover_img,
			timestamp: musicState.timestamp,
			state: musicState.state,
		},
	};
	wsSend(socket, payload);
};
