import { useState, useRef } from 'react';
import { SERVER_IP } from "../../const.jsx"

const AudioPlayer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef(null);

  const handlePlayMusic = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(SERVER_IP + "/music", {
        method: "GET",
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Create a blob from the response
      const blob = await response.blob();
      // Create a URL for the blob
      const audioUrl = URL.createObjectURL(blob);
      
      // Set the audio source and play
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }
    } catch (err) {
      setError('Failed to load music: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handlePlayMusic}>
        {isLoading ? 'Loading...' : 'Play Music'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          {error}
        </div>
      )}

      <audio ref={audioRef} controls style={{ marginTop: '20px' }} />
    </div>
  );
};

export default AudioPlayer;
