import { SERVER_IP } from "@/const";

// Enum to define Music Player State
export enum MPState {
	PLAY = "PLAY",
	PAUSE = "PAUSE",
	CHANGE_MUSIC = "CHANGE_MUSIC",
	CHANGE_VOLUME = "CHANGE_VOLUME",
	CHANGE_TIME = "CHANGE_TIME",
}

// Define interfaces for the data structures
interface MusicTrack {
	id: string;
	title: string;
	artist: string;
	album?: string;
	duration?: number;
}

interface RecentlyPlayedSong extends MusicTrack {
	playedAt: string;
}

/**
 * Fetches a list of music tracks.
 * @returns {Promise<MusicTrack[]>} - A list of music tracks.
 */
export const fetchMusicList = async (): Promise<MusicTrack[]> => {
	try {
		const url = `${SERVER_IP}/get_music`;
		const response = await fetch(url);

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

/**
 * Fetches a list of trending music tracks.
 * @returns {Promise<MusicTrack[]>} - A list of trending music tracks.
 */
export const fetchTrendingSongs = async (): Promise<MusicTrack[]> => {
	try {
		const response = await fetch(`${SERVER_IP}/music/get_trending`);

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

/**
 * Fetches a list of recently played songs for a specific user.
 * @param {string | null} userId - The ID of the user.
 * @param {number} paginationLimit - The number of songs to fetch.
 * @returns {Promise<RecentlyPlayedSong[]>} - A list of recently played songs.
 * @throws {Error} If userId is null
 */
export const fetchRecentlyPlayed = async (
	userId: string | null,
	paginationLimit: number = 30,
): Promise<RecentlyPlayedSong[]> => {
	if (!userId) {
		throw new Error("User ID is required to fetch recently played songs");
	}

	try {
		const url = new URL(`${SERVER_IP}/music/get_recently_played`);
		const params = new URLSearchParams({
			user_id: userId,
			pagination_limit: paginationLimit.toString(),
		});
		url.search = params.toString();

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
	`${SERVER_IP}/image/${songId}.png`;

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
