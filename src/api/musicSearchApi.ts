import { SERVER_IP } from "@/const";

// Define an interface for the search result (adjust based on your actual API response structure)
interface SearchResult {
	id: string;
	title: string;
	artist: string;
	album?: string;
	duration?: number;
	// Add other fields as needed
}

export const searchMusic = async (
	searchString: string,
	start_index = 0,
	page_length = 20,
): Promise<SearchResult[]> => {
	try {
		let url = `${SERVER_IP}/search`;
		const params = new URLSearchParams({
			search_string: searchString,
		});

		// Append params to URL
		url = `${url}?${params.toString()}`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Network response was not ok: ${response.status}`);
		}

		const data: SearchResult[] = await response.json();
		return data;
	} catch (error) {
		console.error("Error performing search:", error);
		throw error;
	}
};
