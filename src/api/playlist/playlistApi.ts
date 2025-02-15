import { SERVER_IP } from "@/const";

// Define and export types
export interface Playlist {
	cover_image: any;
	playlist_id: string;
	playlist_name: string;
	is_playlist_combined: boolean;
	creation_date_time: string;
	last_updated_date_time: string;
}

export interface Song {
	music_id: string;
	artist: string;
	title: string;
	album: string;
	genre: string;
	song_added_date_time: string;
	image_url: string;
}

export interface PlaylistResponse {
	playlist: Playlist;
	songs: Song[];
}

export interface AddSongToPlaylistData {
	playlist_id: string;
	music_id: string;
}

export interface FetchUserPlaylistsResponse {
	user_id: string;
	playlists: Playlist[];
}

export const fetchUserPlaylists = async (
	userId: string,
): Promise<FetchUserPlaylistsResponse> => {
	try {
		const response = await fetch(
			`${SERVER_IP}/playlist/get_users_playlists?user_uuid=${encodeURIComponent(
				userId,
			)}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
		const result = await response.json();
		if (response.status !== 200) {
			throw new Error(result.message || "Failed to fetch playlists");
		}
		return result;
	} catch (error) {
		throw error;
	}
};

export interface CreatePlaylistData {
	playlist_name: string;
	user_id: string;
	is_playlist_combined: boolean;
}

export const createPlaylist = async (
	playlistData: CreatePlaylistData,
): Promise<{
	playlist_id: string;
	message: string;
}> => {
	try {
		const response = await fetch(`${SERVER_IP}/playlist/new`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			// body: JSON.stringify({ ...playlistData, user_id: userId }),
			body: JSON.stringify(playlistData),
		});

		const result = await response.json();

		if (response.status !== 201) {
			throw new Error(result.message || "Failed to create playlist");
		}

		return result;
	} catch (error) {
		throw error;
	}
};

export const fetchPlaylistById = async (
	playlistId: string,
): Promise<PlaylistResponse> => {
	try {
		const response = await fetch(
			`${SERVER_IP}/playlist/get_by_uuid?playlist_id=${playlistId}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) {
			throw new Error("Failed to fetch playlist data");
		}

		const result: PlaylistResponse = await response.json();
		return result;
	} catch (error) {
		throw error;
	}
};

export const addSongToPlaylist = async (
	songData: AddSongToPlaylistData,
): Promise<string> => {
	try {
		const response = await fetch(`${SERVER_IP}/playlist/add_song`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(songData),
		});
		const result = await response.json();
		if (response.status !== 201) {
			throw new Error(result.message || "Failed to add song to playlist");
		}
		return result;
	} catch (error) {
		throw error;
	}
};

export const fetchPlaylistCoverImg = async (
	playlistId: string,
): Promise<string> => {
	try {
		const response = await fetch(
			`${SERVER_IP}/playlist/cover_img/${encodeURIComponent(playlistId)}`,
		);
		if (response.ok) {
			return `${SERVER_IP}/playlist/cover_img/${encodeURIComponent(playlistId)}`;
		} else {
			return "/playlistimages/playlistimage.png"; // Default image
		}
	} catch {
		return "/playlistimages/playlistimage.png"; // Default image on error
	}
};

export const updatePlaylistCoverImg = async (
	playlistId: string,
	imageUrl: string,
): Promise<string> => {
	try {
		// First fetch the image data
		const imageResponse = await fetch(imageUrl);
		if (!imageResponse.ok) {
			throw new Error("Failed to fetch image data");
		}
		const imageBlob: Blob = await imageResponse.blob();

		// Then upload it to the server
		const uploadResponse = await fetch(
			`${SERVER_IP}/playlist/update_cover_img?playlist_id=${encodeURIComponent(playlistId)}`,
			{
				method: "POST",
				body: imageBlob,
				headers: {
					"Content-Type": "image/png",
				},
			},
		);

		if (!uploadResponse.ok) {
			throw new Error(`Upload failed: ${uploadResponse.statusText}`);
		}

		const result: string = await uploadResponse.text();
		return result;
	} catch (error) {
		console.error("Error updating playlist cover image:", error);
		throw error;
	}
};
export const removeSongFromPlaylist = async (
	playlist_id: string,
	music_id: string,
): Promise<string> => {
	try {
		const response = await fetch(`${SERVER_IP}/playlist/remove_song`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ playlist_id, music_id }),
		});

		const result = await response.json();

		if (response.status !== 200) {
			throw new Error(result.message || "Failed to remove song from playlist");
		}
		return result;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const deletePlaylist = async (playlist_id: string): Promise<string> => {
	try {
		const response = await fetch(`${SERVER_IP}/playlist/delete`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ playlist_id }),
		});

		const result = await response.json();

		if (response.status !== 200) {
			throw new Error(result.message || "Failed to delete playlist");
		}

		return result;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

interface PlaylistShare {
	playlist_id: string;
	contributor_user_id: string;
	is_writable: boolean;
}

export const addContributor = async (
	shareData: PlaylistShare,
): Promise<{
	message: string;
}> => {
	try {
		const response = await fetch(`${SERVER_IP}/playlist/contributor`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(shareData),
		});

		const result = await response.json();

		if (response.status !== 200) {
			throw new Error(result.message || "Failed to add contributor");
		}

		return result;
	} catch (error) {
		throw error;
	}
};
