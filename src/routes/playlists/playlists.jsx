import React, { useEffect, useState } from "react";
import { useAppState } from "../../AppState.jsx";
import { SERVER_IP } from "../../const.jsx";


function Playlists() {
  const { appState } = useAppState();
  const currentUserId = appState.user_id;

  const [playlists, setPlaylists] = useState([]); // State to store playlists

  // Function to fetch playlists for the current user
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

      // Log and store the playlists
      console.log("Playlists fetched successfully:", result.playlists);
      setPlaylists(result.playlists || []);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  // Fetch playlists when the component mounts
  useEffect(() => {
    if (currentUserId) {
      fetchPlaylists();
    }
  }, [currentUserId]);

  const handleAddPlaylistClick = async () => {
    const playlistData = {
      playlist_name: "my playlisst 3", // Replace with dynamic input if needed
      user_id: currentUserId, // Use the current user ID from global state
      description: "asf", // Replace with dynamic input if needed
    };

    try {
      const response = await fetch(SERVER_IP+"/playlist/new", {
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

      // Refresh the playlists after creating a new one
      fetchPlaylists();
    } catch (error) {
      console.error("Error creating playlist:", error);
    }
  };

  return (
    <div className="controlbuttons flex justify-center items-center h-screen">
      <button
        className="playbutton bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
        onClick={handleAddPlaylistClick}
      >
        Add Playlist
      </button>

      {/* Display the playlists */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Your Playlists</h2>
        {playlists.length > 0 ? (
          <ul>
            {playlists.map((playlist) => (
              <li key={playlist.playlist_id} className="mb-2">
                <div className="bg-gray-100 p-4 rounded-md">
                  <h3 className="font-semibold">{playlist.playlist_name}</h3>
                  <p>{playlist.description || "No description"}</p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(playlist.creation_date_time).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No playlists found.</p>
        )}
      </div>
    </div>
  );
}

export default Playlists;