import { SERVER_IP } from "../const.jsx";

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
