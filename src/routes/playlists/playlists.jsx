import React from "react";
import { useAppState } from "../../AppState.jsx";

function Playlists() {
  const { appState } = useAppState();
  const currentUserId = appState.user_id;

  const handleAddPlaylistClick = async () => {
    const playlistData = {
      playlist_name: "12 00 pm", // Replace with dynamic input if needed
      user_id: currentUserId, // Use the current user ID from global state
      description: "mfff", // Replace with dynamic input if needed
    };

    try {
      const response = await fetch("http://127.0.0.1:8080/playlist/new", {
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
    </div>
  );
}

export default Playlists;
