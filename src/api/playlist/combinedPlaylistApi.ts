import { SERVER_IP } from "@/const";

interface AddContributorData {
	playlist_id: string;
	contributor_user_id: string;
}
export const addContributor = async (
	contributorData: AddContributorData,
): Promise<string> => {
	try {
		const response = await fetch(
			`${SERVER_IP}/playlist/combined/add_contributor`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(contributorData),
			},
		);
		const result = await response.text();
		if (!response.ok) {
			if (response.status === 400)
				throw new Error("Cannot add contributors to a solo playlist");
			else if (response.status === 404) throw new Error("Playlist not found");
			else throw new Error(result || "Failed to add contributor");
		}
		return result;
	} catch (error) {
		console.log(error);
		throw error;
	}
};

export interface FetchContributorsResponse {
	playlist_owner: string;
	contributors: { contributor_user_id: string }[];
}
export const fetchAllContributors = async (
	playlist_id: string,
): Promise<FetchContributorsResponse> => {
	try {
		const response = await fetch(
			`${SERVER_IP}/playlist/combined/fetch_all_contributors/${encodeURIComponent(playlist_id)}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(errorText || "Failed to fetch contributors");
		}
		const result = await response.json();
		return result as FetchContributorsResponse;
	} catch (error) {
		console.log(error);
		throw error;
	}
};

interface RemoveContributorData {
	playlist_id: string;
	contributor_user_id: string;
}
export const removeContributor = async (
	contributorData: RemoveContributorData,
): Promise<string> => {
	try {
		const response = await fetch(
			`${SERVER_IP}/playlist/combined/remove_contributor`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(contributorData),
			},
		);
		const result = await response.text();
		if (!response.ok) {
			if (response.status === 404) throw new Error("Contributor not found");
			else throw new Error(result || "Failed to remove contributor");
		}
		return result;
	} catch (error) {
		console.log(error);
		throw error;
	}
};
