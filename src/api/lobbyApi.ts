import { SERVER_IP } from "@/const.jsx";

export type LobbyModel = {
	id: string;
	lobby_name: string;
	lobby_icon: string;
	listeners: number;
	song_name: string;
	artist_name: string;
};

export const fetchLobbies = async (lobby_ids: string[]): LobbyModel[] => {
	let lobbies: LobbyModel[] = [];

	for (const id of lobby_ids) {
		let response = await fetch(`${SERVER_IP}/get_lobby/${id}`);
		if (!response.ok) {
			let msg = await response.text();
			console.error("Failed to fetch lobby:", msg);
			continue;
		}

		let data = await response.json();
		let lobby: LobbyModel = {
			id: data.id,
			lobby_name: data.lobby_name,
			lobby_icon: data.lobby_icon,
			listeners: data.listeners,
			song_name: data.song_name,
			artist_name: data.artist_name,
		};

		lobbies.push(lobby);
	}

	return lobbies;
};
