import { SERVER_IP } from "@/const";
import { MusicTrack } from "./musicApi";

export const fetchRecentlyPlayed = async (
	userId: string | null,
	start_index = 0,
	page_length = 20,
): Promise<MusicTrack[]> => {
	if (!userId) {
		throw new Error("User ID is required to fetch recently played songs");
	}

	try {
		let url = `${SERVER_IP}/music/get_recently_played`;
		const params = new URLSearchParams({
			user_id: userId,
			page_length: page_length.toString(),
			start_index: start_index.toString(),
		});
		url = `${url}?${params.toString()}`;
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error("Failed to fetch recently played songs");
		}

		const data: MusicTrack[] = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching recently played songs:", error);
		throw error;
	}
};
