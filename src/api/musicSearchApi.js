import { SERVER_IP } from "../const";

/**
 * Searches for music tracks based on a search string and optional query parameters.
 * @param {string} searchString - The search query.
 * @param {number} [noResultsToGen] - Optional number of results to generate
 * @returns {Promise<Array>} - A list of search results.
 */
export const searchMusic = async (searchString, noResultsToGen) => {
	try {
		let url = `${SERVER_IP}/search?search_string=${encodeURIComponent(
			searchString
		)}`;

		// Add optional number of results parameter if specified
		if (noResultsToGen !== undefined) {
			url += `&no_results_to_gen=${encodeURIComponent(noResultsToGen)}`;
		}

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Network response was not ok: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error performing search:", error);
		throw error;
	}
};
