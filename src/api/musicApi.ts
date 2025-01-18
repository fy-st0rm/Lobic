import { SERVER_IP } from "../const.jsx";

// Define interfaces for the data structures
interface MusicTrack {
	id: string;
	title: string;
	artist: string;
	album?: string;
	duration?: number;
	// Add other fields as needed
}

interface RecentlyPlayedSong extends MusicTrack {
	playedAt: string; // Timestamp of when the song was played
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
 * @param {string} userId - The ID of the user.
 * @param {number} paginationLimit - The number of songs to fetch.
 * @returns {Promise<RecentlyPlayedSong[]>} - A list of recently played songs.
 */
export const fetchRecentlyPlayed = async (
	userId: string,
	paginationLimit: number = 30,
): Promise<RecentlyPlayedSong[]> => {
	try {
		// Construct the URL with query parameters
		const url = new URL(`${SERVER_IP}/music/get_recently_played`);
		const params = new URLSearchParams({
			user_id: userId,
			pagination_limit: paginationLimit.toString(),
		});
		url.search = params.toString();

		// Fetch the data
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
 * @param {string} userId - The ID of the user.
 * @param {string} musicId - The ID of the song being played.
 * @returns {Promise<string>} - A confirmation message.
 */
export const logSongPlay = async (
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
