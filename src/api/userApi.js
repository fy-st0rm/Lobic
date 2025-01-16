import { SERVER_IP } from "../const.jsx";

/**
 * Handles user login.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Promise<boolean>} - True if login is successful, false otherwise.
 */
export const performLogin = async (email, password) => {
	const payload = {
		email: email,
		password: password,
	};

	const response = await fetch(`${SERVER_IP}/login`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const errorMsg = await response.text();
		throw new Error(errorMsg);
	}

	return true;
};

/**
 * Fetches the user's data and updates the client state.
 * @returns {Promise<{ user_id: string }>} - The user's data.
 */
export const initClientState = async () => {
	const response = await fetch(`${SERVER_IP}/get_user`, {
		method: "GET",
		credentials: "include",
	});

	if (!response.ok) {
		const errorMsg = await response.text();
		throw new Error(errorMsg);
	}

	const data = await response.json();
	return data;
};

/**
 * Handles user signup.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @param {string} confirmPassword - Confirmation of the user's password.
 * @returns {Promise<Response>} - The response from the server.
 */
export const signupUser = async (email, password, confirmPassword) => {
	if (password !== confirmPassword) {
		throw new Error("Passwords do not match");
	}

	const payload = {
		email: email,
		username: email.split("@")[0], // [TODO] might need to change later
		password: password,
	};

	const response = await fetch(`${SERVER_IP}/signup`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const errorMsg = await response.text();
		throw new Error(errorMsg);
	}

	return response;
};

/**
 * Fetches the user's profile picture URL.
 * @param {string} userId - The user's ID.
 * @returns {Promise<string>} - The URL of the profile picture or a default image.
 */
export const fetchUserProfilePicture = async (userId) => {
	try {
		const response = await fetch(`${SERVER_IP}/user/get_pfp/${userId}.png`);
		if (response.ok) {
			return `${SERVER_IP}/user/get_pfp/${userId}.png`;
		} else {
			return "/public/sadit.jpg"; // Default image
		}
	} catch {
		return "/public/sadit.jpg"; // Default image on error
	}
};

/**
 * Logs out the user.
 * @param {string} userId - The user's ID.
 * @returns {Promise<Response>} - The response from the server.
 */
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

/**
 * Updates the user's profile picture.
 * @param {string} userUuid - The user's UUID.
 * @param {string} imageUrl - The URL of the new profile picture.
 * @returns {Promise<string>} - The result of the upload.
 */
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
			}
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
