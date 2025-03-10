import { SERVER_IP } from "@/const";

/*
 * Model of a User
 * @member {string} id - Id of the user
 * @member {string} username - Name of the user
 * @member {string} email - Email of the user
 * @member {string} pfp - Profile picture of the user (Optional)
 */
export type User = {
	id: string;
	username: string;
	email: string;
	pfp: string;
};

/**
 * Handles user login.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Promise<boolean>} - True if login is successful, false otherwise.
 */
export const performLogin = async (
	email: string,
	password: string,
): Promise<boolean> => {
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
export const initClientState = async (): Promise<{ user_id: string }> => {
	const response = await fetch(`${SERVER_IP}/get_user`, {
		method: "GET",
		credentials: "include",
	});

	if (!response.ok) {
		const errorMsg = await response.text();
		throw new Error(errorMsg);
	}

	const data: { user_id: string } = await response.json();
	return data;
};

/**
 * Handles user signup.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @param {string} confirmPassword - Confirmation of the user's password.
 * @returns {Promise<Response>} - The response from the server.
 */
export const signupUser = async (
	email: string,
	username: string,
	password: string,
	confirmPassword: string,
): Promise<Response> => {
	if (password.length < 8) {
		throw new Error("Password must be at least 8 characters long");
	}
	if (password !== confirmPassword) {
		throw new Error("Passwords do not match");
	}

	const payload = {
		email: email,
		// username: email.split("@")[0], // [TODO] might need to change later
		username: username,
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
export const fetchUserProfilePicture = async (
	userId: string,
): Promise<string> => {
	try {
		const response = await fetch(`${SERVER_IP}/user/get_pfp/${userId}.png`);
		if (response.ok) {
			return `${SERVER_IP}/user/get_pfp/${userId}.png`;
		} else {
			return "/sadit.jpg"; // Default image
		}
	} catch {
		return "/sadit.jpg"; // Default image on error
	}
};

export const fetchUserPfp = (pfp_id: string): string =>
	`${SERVER_IP}/user/get_pfp/${pfp_id}.png`;

/**
 * Logs out the user.
 * @param {string} userId - The user's ID.
 * @returns {Promise<Response>} - The response from the server.
 */
export const logoutUser = async (userId: string | null): Promise<Response> => {
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
export const updateProfilePicture = async (
	userUuid: string,
	imageUrl: string,
): Promise<string> => {
	try {
		// First fetch the image data
		const imageResponse = await fetch(imageUrl);
		if (!imageResponse.ok) {
			throw new Error("Failed to fetch image data");
		}
		const imageBlob: Blob = await imageResponse.blob();

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

		const result: string = await uploadResponse.text();
		console.log("Upload successful:", result);
		return result;
	} catch (error) {
		console.error("Error updating profile picture:", error);
		throw error;
	}
};

/**
 * Fetches user data from the server.
 * @param {string} userUuid - The user's UUID.
 * @returns {Promise<User>} - The user's data ie usename email id pfp
 */
export const getUserData = async (userId: string): Promise<User> => {
	try {
		// Make a GET request to fetch user data
		const response = await fetch(
			`${SERVER_IP}/user/get_user_data?user_id=${userId}`,
			{
				method: "GET",
				credentials: "include",
			},
		);
		// Check if the response is successful
		if (!response.ok) {
			throw new Error(`Failed to fetch user data: ${response.statusText}`);
		}
		// Parse the JSON response
		const userData: User = await response.json();
		return userData;
	} catch (error) {
		console.error("Error fetching user data:", error);
		throw error;
	}
};

export const searchUser = async (
	searchString: string,
	maxResults: number,
): Promise<Response> => {
	const response = await fetch(
		`${SERVER_IP}/user/search?search_string=${searchString}&max_results=${maxResults}`,
		{
			method: "GET",
			credentials: "include",
		},
	);

	return response;
};
