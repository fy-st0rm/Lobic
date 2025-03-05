import { SERVER_IP } from "@/const";
import { User, getUserData } from "api/user/userApi";

export interface Friend {
	id: string;
	name: string;
}

export const fetchFriends = async (user_id: string): Promise<Friend[]> => {
	let response = await fetch(`${SERVER_IP}/friend/get/${user_id}`, {
		method: "GET",
		credentials: "include",
	});

	if (!response.ok) {
		let msg = await response.text();
		throw new Error(`Fetch Friends Failed: ${msg}`);
	}

	let data = await response.json();
	let friend_ids = data["friends"];

	const friends = await Promise.all(friend_ids.map(async (id: string) => {
		let user = await getUserData(id);
		return {
			id: user.id,
			name: user.username,
		} as Friend;
	}));
	return friends;
};
