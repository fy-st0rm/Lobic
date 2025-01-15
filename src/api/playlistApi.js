import { SERVER_IP } from "../const.jsx";

/**
 * Fetches playlists for a specific user.
 * @param {string} userId - The ID of the user whose playlists are being fetched.
 * @returns {Promise<Array<Object>>} - A list of playlists belonging to the user.
 * @throws {Error} - If the request fails or the response is not OK.
 */
export const fetchUserPlaylists = async (userId) => {
	try {
		const response = await fetch(
			`${SERVER_IP}/playlist/get_users_playlists?user_uuid=${encodeURIComponent(
				userId
			)}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		const result = await response.json();

		if (response.status !== 200) {
			throw new Error(result.message || "Failed to fetch playlists");
		}

		console.log("Playlists fetched successfully:", result.playlists);
		return result.playlists;
	} catch (error) {
		throw error;
	}
};

/**
 * Creates a new playlist.
 * @param {Object} playlistData - The data for the new playlist.
 * @param {string} playlistData.name - The name of the playlist.
 * @param {string} [playlistData.description] - The description of the playlist (optional).
 * @param {string} [playlistData.cover_image] - The URL of the playlist's cover image (optional).
 * @param {Array<string>} [playlistData.songs] - An array of song IDs to add to the playlist (optional).
 * @returns {Promise<Object>} - The response from the server, including the created playlist's details.
 * @throws {Error} - If the request fails or the response is not OK.
 */
export const createPlaylist = async (playlistData) => {
	try {
		const response = await fetch(`${SERVER_IP}/playlist/new`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(playlistData),
		});

		const result = await response.json();

		if (response.status !== 201) {
			throw new Error(result.message || "Failed to create playlist");
		}

		console.log("Playlist created successfully:", result.message);
		return result;
	} catch (error) {
		throw error;
	}
};

/**
 * Fetches a playlist by its ID.
 * @param {string} playlistId - The ID of the playlist to fetch.
 * @returns {Promise<Object>} - The playlist data, including metadata and songs.
 * @throws {Error} - If the request fails or the response is not OK.
 */
export const fetchPlaylistById = async (playlistId) => {
	try {
		const response = await fetch(
			`${SERVER_IP}/playlist/get_by_uuid?playlist_id=${playlistId}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		if (!response.ok) {
			throw new Error("Failed to fetch playlist data");
		}

		const result = await response.json();
		console.log("Playlist Data:", JSON.stringify(result, null, 4));
		return result;
	} catch (error) {
		throw error;
	}
};
