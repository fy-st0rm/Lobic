import { SERVER_IP } from "@/const";

// Define and export types
export interface Playlist {
	playlist_id: string;
	playlist_name: string;
	description: string;
	creation_date_time: string;
	last_updated_date_time: string;
}

export interface FetchUserPlaylistsResponse {
	user_id: string;
	playlists: Playlist[];
}

export interface CreatePlaylistData {
	playlist_name: string;
	user_id: string;
	description?: string;
}

export interface Song {
	music_id: string;
	artist: string;
	title: string;
	album: string;
	genre: string;
	song_added_date_time: string;
}

export interface PlaylistResponse {
	playlist: Playlist;
	songs: Song[];
}

export interface AddSongToPlaylistData {
	playlist_id: string;
	music_id: string;
}

// API Functions
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

export const createPlaylist = async (
	playlistData: CreatePlaylistData,
	userId: string,
): Promise<{ message: string }> => {
	try {
		const response = await fetch(`${SERVER_IP}/playlist/new`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ ...playlistData, user_id: userId }),
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
		console.log(result);
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
		console.log("Song added to playlist successfully:", result);
		return result;
	} catch (error) {
		throw error;
	}
};
