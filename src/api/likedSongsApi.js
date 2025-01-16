import { SERVER_IP } from "../const.jsx";

/**
 * Fetches a list of liked songs for a specific user.
 * @param {string} userId - The ID of the user.
 * @param {number} [paginationLimit] - Optional. The number of songs to fetch. fetches all if nothing is provided
 * @returns {Promise<Array>} - A list of liked songs.
 */
export const fetchLikedSongs = async (userId, paginationLimit) => {
	try {
		// Construct the URL with query parameters
		const url = new URL(`${SERVER_IP}/liked_songs`);
		const params = new URLSearchParams({
			user_id: userId,
		});

		// Add pagination_limit if provided
		if (paginationLimit !== undefined) {
			params.append("pagination_limit", paginationLimit);
		}

		url.search = params.toString();

		// Fetch the data
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error("Failed to fetch liked songs");
		}

		const data = await response.json();
		console.log("Fetched liked songs:", data); // Log the result
		return data;
	} catch (error) {
		console.error("Error fetching liked songs:", error);
		throw error;
	}
};

/**
 * Adds a song to the user's liked songs.
 * @param {string} userId - The ID of the user.
 * @param {string} musicId - The ID of the song.
 * @returns {Promise<string>} - A confirmation message.
 */
export const addToLikedSongs = async (userId, musicId) => {
	try {
		const response = await fetch(`${SERVER_IP}/liked_songs/add`, {
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
			throw new Error("Failed to add song to liked songs");
		}

		const result = await response.json();
		console.log("Added to liked songs:", result); // Log the result
		return result;
	} catch (error) {
		console.error("Error adding to liked songs:", error);
		throw error;
	}
};

/**
 * Removes a song from the user's liked songs.
 * @param {string} userId - The ID of the user.
 * @param {string} musicId - The ID of the song.
 * @returns {Promise<string>} - A confirmation message.
 */
export const removeFromLikedSongs = async (userId, musicId) => {
	try {
		const response = await fetch(`${SERVER_IP}/liked_songs/remove`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				user_id: userId,
				music_id: musicId,
			}),
		});

		if (!response.ok) {
			throw new Error("Failed to remove song from liked songs");
		}

		const text = await response.text();
		console.log("Removed from liked songs:", text); // Log the result
		return text;
	} catch (error) {
		console.error("Error removing from liked songs:", error);
		throw error;
	}
};
