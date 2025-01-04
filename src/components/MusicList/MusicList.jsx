import React, { useState, useEffect } from 'react';
import Music from '../Music/Music';
import './MusicList.css';
import { SERVER_IP } from "../../const.jsx";

function MusicList({ list_title, onSongClick }) {
  const [musicItems, setMusicItems] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSongId, setSelectedSongId] = useState(null);

  // Fetch music data when the component mounts
  useEffect(() => {
    fetchMusicData();
  }, []);

  // Fetch music data from the server
  const fetchMusicData = async () => {
    try {
      const response = await fetch(`${SERVER_IP}/get_music`);
      if (!response.ok) throw new Error('Failed to fetch music data');
      const data = await response.json();
      setMusicItems(data);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Get the URL for the cover art image
  const getImageUrl = (songId) => `${SERVER_IP}/image/${songId}.png`;

  // Handle click on a music item
  const handleMusicClick = (item) => {
    console.log('Clicked Song Details:', item);
    setSelectedSongId(item.id);
    onSongClick(item); // Call the onSongClick function passed from the parent
  };

  // Show loading state while fetching data
  if (isLoading) return <div>Loading music...</div>;

  // Show error message if there's an error
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="music-list-container">
      <h2 className="list-title"> {list_title} </h2>
      <div className="music-list">
        {musicItems.map((item) => (
          <div
            key={item.id}
            className={`music-item-wrapper ${
              selectedSongId === item.id ? 'selected' : ''
            }`}
            onClick={() => handleMusicClick(item)}
          >
            <Music
              title={item.title}
              artist={item.artist}
              coverArt={getImageUrl(item.id)}
              album={item.album}
              genre={item.genre}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default MusicList;