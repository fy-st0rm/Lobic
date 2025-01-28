import { SERVER_IP } from "@/const";
import { MusicTrack } from "./musicApi";

/**
 * Fetches a list of trending music tracks.
 * @returns {Promise<MusicTrack[]>} - A list of trending music tracks.
 */
export const fetchTrendingSongs = async (
	start_index = 0,
	page_length = 20,
): Promise<MusicTrack[]> => {
	try {
		let url = `${SERVER_IP}/music/get_trending`;
		const params = new URLSearchParams({
			page_length: page_length.toString(),
			start_index: start_index.toString(),
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
			throw new Error("Failed to fetch trending music data");
		}

		const data: MusicTrack[] = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching trending songs:", error);
		throw error;
	}
};
