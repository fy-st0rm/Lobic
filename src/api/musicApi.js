import { SERVER_IP } from "../const.jsx";

/**
 * Fetches a list of music tracks with optional query parameters.
 * @param {Object} options - Options for fetching music data.
 * @param {boolean} [options.isTrending=false] - Whether to fetch trending music.
 * @returns {Promise<Array>} - A list of music tracks.
 */
export const fetchMusicList = async () => {
	try {
		let url = `${SERVER_IP}/get_music`;
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error("Failed to fetch music data");
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching music list:", error);
		throw error;
	}
};

/**
 * Fetches a list of music tracks
 * @returns {Promise<Array>} - A list of music tracks.
 */
export const fetchTrendingSongs = async () => {
	try {
		const response = await fetch(`${SERVER_IP}/music/get_trending`);
		if (!response.ok) {
			throw new Error("Failed to fetch music data");
		}
		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching music list:", error);
		throw error;
	}
};

/**
 * Fetches a list of recently played songs for a specific user.
 * @param {string} userId - The ID of the user.
 * @param {number} paginationLimit - The number of songs to fetch.
 * @returns {Promise<Array>} - A list of recently played songs.
 */
export const fetchRecentlyPlayed = async (userId, paginationLimit = 30) => {
	try {
		// Construct the URL with query parameters
		const url = new URL(`${SERVER_IP}/music/get_recently_played`);
		const params = new URLSearchParams({
			user_id: userId,
			pagination_limit: paginationLimit,
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

		const data = await response.json();
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
export const logSongPlay = async (userId, musicId) => {
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

		const text = await response.text();
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
export const incrementPlayCount = async (songId) => {
	try {
		const response = await fetch(
			`${SERVER_IP}/music/incr_times_played/${songId}`,
			{
				method: "POST",
			}
		);

		if (!response.ok) {
			throw new Error("Failed to increment play count");
		}

		const text = await response.text();
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
export const getMusicImageUrl = (songId) => `${SERVER_IP}/image/${songId}.png`;
