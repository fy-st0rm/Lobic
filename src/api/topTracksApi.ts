import { SERVER_IP } from "@/const";

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

/*
 * Fetches a list of top tracks for a specific user.
 * @param {string | null} userId - The ID of the user.
 * @param {number} [paginationLimit] - Optional. The number of tracks to fetch.
 * @returns {Promise<TopTrack[]>} - A list of top tracks.
 */
export const fetchTopTracks = async (
	userId: string | null,
	paginationLimit?: number,
): Promise<TopTrack[]> => {
	if (!userId) {
		console.log("No user ID provided, returning empty top tracks array");
		return [];
	}

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
		const response = await fetch(url.toString(), {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

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
