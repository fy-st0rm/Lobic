import { SERVER_IP } from "@/const";

interface LikedSong {
	id: string;
	title: string;
	artist: string;
	album: string;
	duration?: number;
}

/**
 * Fetches a list of liked songs for a specific user.
 * @param {string | null} userId - The ID of the user.
 * @param {number} [paginationLimit] - Optional. The number of songs to fetch. Fetches all if nothing is provided.
 * @returns {Promise<LikedSong[]>} - A list of liked songs.
 */
export const fetchLikedSongs = async (
	userId: string | null,
	start_index = 0,
	page_length = 20,
): Promise<LikedSong[]> => {
	if (!userId) {
		console.log("No user ID provided, returning empty playlist array");
		return [];
	}

	try {
		// Construct the URL with query parameters
		let url = `${SERVER_IP}/music/liked_song/get`;
		const params = new URLSearchParams({
			user_id: userId,
			page_length: page_length.toString(),
			start_index: start_index.toString(),
		});

		url = `${url}?${params.toString()}`;

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

		const data: LikedSong[] = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching liked songs:", error);
		throw error;
	}
};

/**
 * Adds a song to the user's liked songs.
 * @param {string | null} userId - The ID of the user.
 * @param {string | null} musicId - The ID of the song.
 * @returns {Promise<string | object>} - A confirmation message or JSON response.
 */
export const addToLikedSongs = async (
	userId: string | null,
	musicId: string | null,
): Promise<string | object> => {
	if (!userId) {
		console.log("No user ID provided, cannot add the song");
		return [];
	}
	if (!musicId) {
		console.log("No music ID provided, cannot add the song");
		return [];
	}

	try {
		const payload = {
			user_id: userId,
			music_id: musicId,
		};

		const response = await fetch(`${SERVER_IP}/music/liked_song/add`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (response.status !== 201) {
			const errorResponse = await response.json();
			const errorMessage =
				errorResponse.message || "Failed to add song to liked songs";

			if (response.status === 409) {
				console.log("Song already exists in liked songs");
			}

			throw new Error(errorMessage);
		}

		// Handle 201 Created response
		const contentType = response.headers.get("content-type");
		if (contentType && contentType.includes("application/json")) {
			const result: object = await response.json();
			return result;
		} else {
			const result: string = await response.text();
			return result;
		}
	} catch (error) {
		console.error("Error adding to liked songs:", error);
		throw error;
	}
};

/**
 * Removes a song from the user's liked songs.
 * @param {string | null} userId - The ID of the user.
 * @param {string | null} musicId - The ID of the song.
 * @returns {Promise<string>} - A confirmation message.
 */
export const removeFromLikedSongs = async (
	userId: string | null,
	musicId: string | null,
): Promise<string> => {
	if (!userId) {
		console.log("No user ID provided, cannot remove the song");
		return "Error: No user ID provided";
	}
	if (!musicId) {
		console.log("No music ID provided, cannot remove the song");
		return "Error: No music ID provided";
	}

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

		const text: string = await response.text();
		console.log("Removed from liked songs:", text);
		return text;
	} catch (error) {
		console.error("Error removing from liked songs:", error);
		throw error;
	}
};

/**
 * Fetches whether a song is liked by a user.
 * @param {string | null} userId - The ID of the user.
 * @param {string} musicId - The ID of the song.
 * @returns {Promise<boolean>} A boolean indicating whether the song is liked.
 */
export const fetchIsSongLiked = async (
	userId: string | null,
	musicId: string,
): Promise<boolean> => {
	if (!userId) {
		console.log("No user ID provided, returning false");
		return false;
	}

	try {
		const url = `${SERVER_IP}/music/liked_song/is_song_liked?user_id=${encodeURIComponent(userId)}&music_id=${encodeURIComponent(musicId)}`;
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const data = await response.text();
		return data === "true";
	} catch (err) {
		console.error("Failed to fetch song liked state:", err);
		throw err;
	}
};

/**
 * Toggles the liked state of a song for a user.
 * @param {string | null} userId - The ID of the user.
 * @param {string} musicId - The ID of the song.
 * @returns {Promise<string>} A string indicating the result of the operation.
 */
export const toggleSongLiked = async (
	userId: string | null,
	musicId: string,
): Promise<string> => {
	if (!userId) {
		console.log("No user ID provided, cannot toggle like state");
		return "Error: No user ID provided";
	}

	try {
		const response = await fetch(`${SERVER_IP}/music/liked_song/toggle_like`, {
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
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.text();
		return data;
	} catch (err) {
		console.error("Failed to toggle song liked state:", err);
		throw err;
	}
};
