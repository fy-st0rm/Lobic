import React from "react";
import Playlist from "./Playlist/Playlist";

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
    <div className="ml-10 mt-5">
      <h2 className="text-white mb-2.5">Public Playlists</h2>
      <div className="flex overflow-x-scroll flex-nowrap scrollbar-none">
        {playlists.map((playlist) => (
          <div key={playlist.id}>
            <Playlist image={playlist.image} title={playlist.title} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistsContainer;
