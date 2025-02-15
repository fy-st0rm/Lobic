import React from "react";
import "./Playlist.css";

interface PlaylistProps {
	image: string;
	title: string;
}

const Playlist: React.FC<PlaylistProps> = ({ image, title }) => {
	return (
		<div className="playlist-card-container">
			<div className="playlist-photo-container">
				<img className="playlist-photo" src={image} alt={title} />
			</div>
			<h4>{title}</h4>
		</div>
	);
};

export default Playlist;
