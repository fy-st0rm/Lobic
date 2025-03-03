import { SERVER_IP } from "@/const";

export type LobbyModel = {
	id: string;
	lobby_name: string;
	lobby_icon: string;
	listeners: number;
	song_name: string;
	artist_name: string;
};

export const fetchLobby = async (id: string): Promise<LobbyModel | null> => {
	try {
		const response = await fetch(`${SERVER_IP}/get_lobby/${id}`);
		if (!response.ok) {
			const msg = await response.text();
			console.error("Failed to fetch lobby:", msg);
			return null;
		}

		const data = await response.json();
		return {
			id: data.id,
			lobby_name: data.lobby_name,
			lobby_icon: data.lobby_icon,
			listeners: data.listeners,
			song_name: data.song_name,
			artist_name: data.artist_name,
		};
	} catch (error) {
		console.error("Error fetching lobby:", error);
		return null;
	}
};

export const fetchLobbies = async (
	lobby_ids: string[],
): Promise<LobbyModel[]> => {
	const lobbies = await Promise.all(lobby_ids.map((id) => fetchLobby(id)));

	// Filter out null values
	return lobbies.filter((lobby): lobby is LobbyModel => lobby !== null);
};
