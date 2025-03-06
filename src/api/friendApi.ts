import { SERVER_IP } from "@/const";
import { User, getUserData } from "api/user/userApi";

export interface Friend {
	id: string;
	name: string;
}

export const fetchFriends = async (userId: string): Promise<Friend[]> => {
	let response = await fetch(`${SERVER_IP}/friend/get/${userId}`, {
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

/*
 * Sends friend request to the designated user.
 * @param {string} userId - Id of the user who's sending the friend request.
 * @param {string} friendId - Id of the user to whom the friend request is sent.
 * @returns {Promise<Response>} - The response from the server.
 */
export const addFriend = async (userId: string, friendId: string) => {
	const payload = {
		user_id: userId,
		friend_id: friendId
	};

	let response = await fetch(`${SERVER_IP}/friend/add`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	})

	if (!response.ok) {
		let msg = await response.text();
		throw new Error(`Add Friend Failed: ${msg}`);
	}
}

export const removeFriend = async (userId: string, friendId: string) => {
	const payload = {
		user_id: userId,
		friend_id: friendId
	};

	let response = await fetch(`${SERVER_IP}/friend/remove`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	})

	if (!response.ok) {
		let msg = await response.text();
		throw new Error(`Remove Friend Failed: ${msg}`);
	}
}
