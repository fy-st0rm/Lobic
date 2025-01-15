import { SERVER_IP } from "../const.jsx";

export const fetchUserProfilePicture = async (userId) => {
	try {
		const response = await fetch(`${SERVER_IP}/user/get_pfp/${userId}.png`);

		if (response.ok) {
			return `${SERVER_IP}/user/get_pfp/${userId}.png`;
		} else {
			return "/public/sadit.jpg"; // Default image
		}
	} catch (error) {
		console.error("Error fetching profile picture:", error);
		return "/public/sadit.jpg"; // Default image on error
	}
};

export const logoutUser = async (userId) => {
	try {
		const response = await fetch(`${SERVER_IP}/logout`, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ user_id: userId }),
		});

		if (!response.ok) {
			throw new Error("Logout failed");
		}

		return response;
	} catch (error) {
		console.error("Error during logout:", error);
		throw error;
	}
};

export const updateProfilePicture = async (userUuid, imageUrl) => {
	try {
		// First fetch the image data
		const imageResponse = await fetch(imageUrl);
		if (!imageResponse.ok) {
			throw new Error("Failed to fetch image data");
		}
		const imageBlob = await imageResponse.blob();

		// Then upload it to the server
		const uploadResponse = await fetch(
			`${SERVER_IP}/user/update_pfp?user_uuid=${userUuid}`,
			{
				method: "POST",
				body: imageBlob,
				headers: {
					"Content-Type": "image/png",
				},
			},
		);

		if (!uploadResponse.ok) {
			throw new Error(`Upload failed: ${uploadResponse.statusText}`);
		}

		const result = await uploadResponse.text();
		console.log("Upload successful:", result);
		return result;
	} catch (error) {
		console.error("Error updating profile picture:", error);
		throw error;
	}
};
