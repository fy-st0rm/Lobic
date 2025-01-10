import React, { useEffect, useState } from "react";
import { useAppState } from "../../AppState.jsx";
import { SERVER_IP } from "../../const.jsx";
import { useNavigate } from "react-router-dom";

function Playlists() {
  const { appState } = useAppState();
  const currentUserId = appState.user_id;
  const navigate = useNavigate();

  const [playlists, setPlaylists] = useState([]);

  const fetchPlaylists = async () => {
    try {
      const response = await fetch(
        `${SERVER_IP}/playlist/get_users_playlists?user_uuid=${encodeURIComponent(currentUserId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.status !== 200) {
        throw new Error(result.message || "Failed to fetch playlists");
      }
      console.log("Playlists fetched successfully:", result.playlists);
      setPlaylists(result.playlists);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchPlaylists();
    }
  }, [currentUserId]);

  //create a new playlist
  const handleAddPlaylistClick = async () => {
    const playlistData = {
      playlist_name: "my playlisst 3", 
      user_id: currentUserId,
      description: "asf",
    };

    try {
      const response = await fetch(`${SERVER_IP}/playlist/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistData),
      });

      const result = await response.json();

      if (response.status !== 201) {
        throw new Error(result.message || "Failed to create playlist");
      }

      console.log("Playlist created successfully:", result.message);
      fetchPlaylists();
    } catch (error) {
      console.error("Error creating playlist:", error);
    }
  };

  //gop to a particular playlist
  const handlePlaylistClick = (playlist) => {
    navigate(`/playlist/${playlist.playlist_id}`, { state: { playlistData: playlist } });
  };

  return (
    <div className="controlbuttons flex flex-col justify-center items-center min-h-screen p-8">
      <button
        className="playbutton bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
        onClick={handleAddPlaylistClick}
      >
        Add Playlist
      </button>

      <div className="mt-8 w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-6 text-white">Your Playlists</h2>
        {playlists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((playlist) => (
              <div
                key={playlist.playlist_id}
                onClick={() => handlePlaylistClick(playlist)}
                className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg cursor-pointer transition-all transform hover:scale-105"
              >
                <h3 className="font-semibold text-xl text-white mb-2">
                  {playlist.playlist_name}
                </h3>
                <p className="text-gray-300 mb-3">
                  {playlist.description || "No description"}
                </p>
                <p className="text-sm text-gray-400">
                  Created: {new Date(playlist.creation_date_time).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-300 text-center">No playlists found.</p>
        )}
      </div>
    </div>
  );
}

export default Playlists;