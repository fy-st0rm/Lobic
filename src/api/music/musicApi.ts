import { SERVER_IP } from "@/const";
import { OpCode, wsSend } from "api/socketApi";
import { AppState } from "providers/AppProvider";
import { LobbyState } from "providers/LobbyProvider";
import { MusicState } from "providers/MusicProvider";

export enum MPState {
	PLAY = "PLAY",
	PAUSE = "PAUSE",
	CHANGE_MUSIC = "CHANGE_MUSIC",
	CHANGE_VOLUME = "CHANGE_VOLUME",
	CHANGE_TIME = "CHANGE_TIME",
	EMPTY = "EMPTY",
}

export interface MusicTrack {
	id: string;
	title: string;
	artist: string;
	album: string;
	duration?: number;
	image_url: string;
}

/*
 * Fetches the single using music id
 * @param {string} musicId - Id of the music
 * @returns {Promise<MusicTract | null} - Returns MusicTrack if succed else null
 */

export const getMusic = async (musicId: string): Promise<MusicTrack | null> => {
	let url = `${SERVER_IP}/music/get_music?uuid=${musicId}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		console.error("Failed to fetch music data");
		return null;
	}

	const data: MusicTrack[] = await response.json();
	return data[0];
};

/**
 * Fetches a list of music tracks.
 * @returns {Promise<MusicTrack[]>} - A list of music tracks.
 */
export const fetchMusicList = async (
	start_index = 0,
	page_length = 20,
	title?: string,
	uuid?: string,
	artist?: string,
	album?: string,
	genre?: string,
	randomizer = true,
): Promise<MusicTrack[]> => {
	try {
		let url = `${SERVER_IP}/music/get_music`;
		const params = new URLSearchParams({
			page_length: page_length.toString(),
			start_index: start_index.toString(),
			randomizer: randomizer.toString(),
		});

		// Add optional parameters if provided
		if (uuid) params.append("uuid", uuid);
		if (title) params.append("title", title);
		if (artist) params.append("artist", artist);
		if (album) params.append("album", album);
		if (genre) params.append("genre", genre);

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
			throw new Error("Failed to fetch music data");
		}

		const data: MusicTrack[] = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching music list:", error);
		throw error;
	}
};

//this now handels the put logic for trending and top tracks
export const updatePlayLog = async (
	userId: string,
	musicId: string,
): Promise<string> => {
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
			image_url: musicState.image_url,
			timestamp: musicState.timestamp,
			state: musicState.state,
		},
	};
	console.log(payload);
	wsSend(socket, payload);
};

export const ImageFromUrl = (image_url: string): string =>
	`${SERVER_IP}/image/${image_url}`;
