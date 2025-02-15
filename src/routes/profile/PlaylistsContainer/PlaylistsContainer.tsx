import React from "react";
import Playlist from "./Playlist/Playlist";
import "./PlaylistsContainer.css";

interface PlaylistItem {
	id: number;
	image: string;
	title: string;
}

const PlaylistsContainer: React.FC = () => {
	const playlists: PlaylistItem[] = [
		{ id: 1, image: "/sadit.jpg", title: "Playlist 1" },
		{ id: 2, image: "/sadit.jpg", title: "Playlist 2" },
		{ id: 3, image: "/sadit.jpg", title: "Playlist 3" },
		{ id: 4, image: "/sadit.jpg", title: "Playlist 4" },
		{ id: 5, image: "/sadit.jpg", title: "Playlist 5" },
		{ id: 6, image: "/sadit.jpg", title: "Playlist 6" },
	];

	return (
		<div className="playlists-container">
			<h2 className="playlists-title">Public Playlists</h2>
			<div className="playlists">
				{playlists.map((playlist) => (
					<div className="playlist-item-wrapper" key={playlist.id}>
						<Playlist image={playlist.image} title={playlist.title} />
					</div>
				))}
			</div>
		</div>
	);
};

export default PlaylistsContainer;
