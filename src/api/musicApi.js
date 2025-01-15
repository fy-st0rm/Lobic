import { SERVER_IP } from "../const.jsx";

/**
 * Fetches a list of music tracks with optional query parameters.
 * @param {Object} options - Options for fetching music data.
 * @param {boolean} [options.isTrending=false] - Whether to fetch trending music.
 * @returns {Promise<Array>} - A list of music tracks.
 */
export const fetchMusicList = async (isTrending = false) => {
	try {
		let url = `${SERVER_IP}/get_music`;
		if (isTrending) {
			url += "?trending=true";
		}

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
