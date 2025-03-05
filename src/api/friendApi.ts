import { SERVER_IP } from "@/const";

export const fetchFriends = async (user_id: string): Promise<string[]> => {
	let response = await fetch(`${SERVER_IP}/friend/get/${user_id}`, {
		method: "GET",
		credentials: "include",
	});

	if (!response.ok) {
		let msg = await response.text();
		throw new Error(`Fetch Friends Failed: ${msg}`);
	}

	let data = await response.json();
	let friends = data["friends"];
	return friends;
};
