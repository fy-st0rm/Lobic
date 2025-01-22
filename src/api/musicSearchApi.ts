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

/**
 * Searches for music tracks based on a search string and optional query parameters.
 * @param {string} searchString - The search query.
 * @param {number} [noResultsToGen] - Optional number of results to generate.
 * @returns {Promise<SearchResult[]>} - A list of search results.
 */
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

		// Add pagination_limit if provided
		params.append("page_length", page_length.toString());
		params.append("start_index", start_index.toString());
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
