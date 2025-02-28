import React from "react";
import Playlist from "./Playlist/Playlist";

interface PlaylistItem {
  id: string;
  imageUrl: string;
  title: string;
  artist: string;
}

const PlaylistContainer: React.FC = () => {
  // Sample data matching the images
  const playlists: PlaylistItem[] = [
    { id: "1", imageUrl: "/sadit.jpg", title: "Apt", artist: "artist1" },
    { id: "2", imageUrl: "/sadit.jpg", title: "Popstar", artist: "artist2" },
    { id: "3", imageUrl: "/sadit.jpg", title: "Bitch", artist: "artist3" },
    { id: "4", imageUrl: "/sadit.jpg", title: "Yooo", artist: "artist4" },
    { id: "5", imageUrl: "/sadit.jpg", title: "Song 1", artist: "artist5" },
    { id: "6", imageUrl: "/sadit.jpg", title: "Song 2", artist: "artist6" },
  ];

  const handlePlaylistClick = (id: string) => {
    console.log(`Playlist ${id} clicked`);
    // Add your navigation or playback logic here
  };

  return (
    <div className="bg-primary min-h-screen p-6">
      <h2 className="text-white text-xl font-bold mb-4">Recently Played</h2>
      <div className="flex flex-wrap">
        {playlists.map((playlist) => (
          <Playlist 
            key={playlist.id}
            playlistId={playlist.id}
            imageUrl={playlist.imageUrl}
            title={playlist.title}
            artist={playlist.artist}
            onClick={() => handlePlaylistClick(playlist.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default PlaylistContainer;