import { SERVER_IP } from "@/const";
import { MusicTrack } from "./musicApi";

export const fetchTopTracks = async (
	userId: string | null,
	start_index = 0,
	page_length = 20,
): Promise<MusicTrack[]> => {
	if (!userId) {
		console.log("No user ID provided, returning empty top tracks array");
		return [];
	}
	try {
		// Construct the URL with query parameters
		let url = `${SERVER_IP}/music/get_top_tracks`;
		const params = new URLSearchParams({
			user_id: userId,
			page_length: page_length.toString(),
			start_index: start_index.toString(),
		});
		url = `${url}?${params.toString()}`;

		// Fetch the data
		const response = await fetch(url.toString(), {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error("Failed to fetch top tracks");
		}
		const data: MusicTrack[] = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching top tracks:", error);
		throw error;
	}
};
