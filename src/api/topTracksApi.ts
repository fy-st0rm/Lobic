import { SERVER_IP } from "@/const.jsx";

interface TopTrack {
	id: string;
	filename: string;
	artist: string;
	title: string;
	album: string;
	genre: string;
	times_played: number;
	cover_art_path: string;
}

/**
 * Fetches a list of top tracks for a specific user.
 * @param {string} userId - The ID of the user.
 * @param {number} [paginationLimit] - Optional. The number of tracks to fetch.
 * @returns {Promise<TopTrack[]>} - A list of top tracks.
 */
export const fetchTopTracks = async (
	userId: string,
	paginationLimit?: number,
): Promise<TopTrack[]> => {
	try {
		// Construct the URL with query parameters
		const url = new URL(`${SERVER_IP}/music/get_top_tracks`);
		const params = new URLSearchParams({
			user_id: userId,
		});

		// Add pagination_limit if provided
		if (paginationLimit !== undefined) {
			params.append("pagination_limit", paginationLimit.toString());
		}

		url.search = params.toString();

		// Fetch the data
		const response = await fetch(url.toString());

		if (!response.ok) {
			throw new Error("Failed to fetch top tracks");
		}
		const data: TopTrack[] = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching top tracks:", error);
		throw error;
	}
};
