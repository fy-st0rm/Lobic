import React from "react";
import Playlist from "../Playlist/Playlist.jsx";
import "./PlaylistsContainer.css";

function PlaylistsContainer() {
  const playlists = [
    { id: 1, image: "/public/sadit.jpg", title: "Playlist 1" },
    { id: 2, image: "/public/sadit.jpg", title: "Playlist 2" },
    { id: 3, image: "/public/sadit.jpg", title: "Playlist 3" },
    { id: 4, image: "/public/sadit.jpg", title: "Playlist 4" },
    { id: 5, image: "/public/sadit.jpg", title: "Playlist 5" },
    { id: 6, image: "/public/sadit.jpg", title: "Playlist 6" },
  ];

  return (
    <>
      <div className="playlists-container">
        <h2 className="playlists-title"> Public Playlists </h2>
        <div className="playlists">
          {playlists.map((playlist) => (
            <div className="playlist-item-wrapper" key={playlist.id}>
              <Playlist image={playlist.image} title={playlist.title} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default PlaylistsContainer;
