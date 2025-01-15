import { SERVER_IP } from "../const";

/**
 * Searches for music tracks based on a search string and optional query parameters.
 * @param {string} searchString - The search query.
 * @returns {Promise<Array>} - A list of search results.
 */
export const searchMusic = async (searchString) => {
	try {
		const response = await fetch(
			`${SERVER_IP}/search?&search_string=${encodeURIComponent(searchString)}`
		);

		if (!response.ok) {
			throw new Error("Network response was not ok");
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error performing search:", error);
		throw error;
	}
};
