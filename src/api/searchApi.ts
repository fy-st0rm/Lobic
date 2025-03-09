import { SERVER_IP } from "@/const";

export interface SearchResponse {
	songs: MusicResponse[];
	people: UserDataResponse[];
	playlists: Playlist[];
}

export interface UserDataResponse {
	user_id: string;
	username: string;
	email: string;
}

interface MusicResponse {
	id: string;
	artist: string;
	title: string;
	album: string;
	genre: string;
	times_played: number;
	duration: number;
	image_url: string;
}

interface Playlist {
	[x: string]: any;
	playlist_id: string;
	playlist_name: string;
	user_id: string;
	creation_date_time: string;
	last_updated_date_time: string;
	is_playlist_combined: boolean;
}

export const search = async (
	search_category: string,
	search_string: string,
): Promise<SearchResponse> => {
	try {
		let url = `${SERVER_IP}/search`;
		const params = new URLSearchParams({
			search_category: search_category,
			search_string: search_string,
		});

		// Append params to URL
		url = `${url}?${params.toString()}`;

		// Fetch the data
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error("Failed to search");
		}

		const data: SearchResponse = await response.json();
		return data;
	} catch (error) {
		console.error("Error:", error);
		throw error;
	}
};
