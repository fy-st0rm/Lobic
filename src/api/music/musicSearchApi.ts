import { SERVER_IP } from "@/const";
import { MusicTrack } from "./musicApi";

export const searchMusic = async (
	searchString: string,
	start_index = 0,
	page_length = 20,
): Promise<MusicTrack[]> => {
	try {
		let url = `${SERVER_IP}/search_music`;
		const params = new URLSearchParams({
			search_string: searchString,
		});

		url = `${url}?${params.toString()}`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Network response was not ok: ${response.status}`);
		}

		const data: MusicTrack[] = await response.json();
		return data;
	} catch (error) {
		console.error("Error performing search:", error);
		throw error;
	}
};
