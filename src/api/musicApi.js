import { SERVER_IP } from "../const.jsx";

export const fetchMusicList = async (isTrending = false) => {
	try {
		let url = `${SERVER_IP}/get_music`;
		if (isTrending) {
			url += "?trending=true";
		}

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error("Failed to fetch music data");
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching music list:", error);
		throw error;
	}
};

export const incrementPlayCount = async (songId) => {
	try {
		const response = await fetch(
			`${SERVER_IP}/music/incr_times_played/${songId}`,
			{
				method: "POST",
			}
		);

		if (!response.ok) {
			throw new Error("Failed to increment play count");
		}

		const text = await response.text();
		return text;
	} catch (error) {
		console.error("Error incrementing play count:", error);
		throw error;
	}
};

export const getMusicImageUrl = (songId) => `${SERVER_IP}/image/${songId}.png`;
