import { SERVER_IP } from "@/const";

export type Category = "artists" | "albums" | "genres";
export const browseAll = async (category: Category): Promise<string[]> => {
	try {
		const url = `${SERVER_IP}/music/browse_all/${category}`;
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch ${category}`);
		}

		return await response.json();
	} catch (error) {
		console.error(`Error fetching ${category}:`, error);
		throw error;
	}
};
