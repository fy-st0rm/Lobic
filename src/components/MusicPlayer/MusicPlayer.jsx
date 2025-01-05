import React, { useRef, useState, useEffect } from 'react';
import previousButton from "/controlbar/PreviousButton.svg";
import playButton from "/controlbar/ButtonPlay.svg";
import pauseButton from "/controlbar/ButtonPause.svg";
import NextButton from "/controlbar/ButtonNext.svg";
import VolumeLow from "/volumecontrols/Volume Level Low.png";
import Mute from "/volumecontrols/Volume Mute.png";
import VolumeHigh from "/volumecontrols/Volume Level High.png";
import logo from "/covers/cover.jpg";
import "./MusicPlayer.css";
import { SERVER_IP } from "../../const.jsx";

function MusicPlayer({ selectedSong }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [initialVolume, setInitialVolume] = useState(volume);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedSong) {
      console.log('Resetting audio element for new song:', selectedSong.title);
  
      // Pause and reset the current song
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ''; // Clear the previous source
        audioRef.current.load(); // Reset the audio element
      }
  
      setIsPlaying(false); // Reset the playing state
      setCurrentTime(0); // Reset the current time
      setDuration(0); // Reset the duration
      setError(''); // Clear any errors
    }
  }, [selectedSong]); // Trigger this effect when selectedSong changes
  
  // Use a separate useEffect to handle auto-play after isPlaying is set to false
  useEffect(() => {
    if (selectedSong && !isPlaying) {
      handlePlayMusic();
    }
  }, [selectedSong, isPlaying]); // Trigger this effect when selectedSong or isPlaying changes

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handlePlayMusic = async () => {
    try {
      if (isPlaying) {
        console.log('Pausing current song');
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }
  
      setIsLoading(true);
      setError('');
  
      if (!selectedSong) {
        throw new Error('No song selected');
      }
  
      if (audioRef.current) {
        // Reset the audio element
        audioRef.current.pause();
        audioRef.current.src = ''; // Clear the previous source
        audioRef.current.load(); // Reset the audio element
  
        // Set the new source and wait for it to load
        audioRef.current.src = selectedSong.audioUrl;
        await new Promise((resolve) => {
          audioRef.current.onloadeddata = resolve; // Wait for the new source to load
        });
  
        console.log('Audio source set, attempting to play...');
        await audioRef.current.play();
        setIsPlaying(true);
        console.log('Song is now playing');
      }
    } catch (err) {
      console.error('Failed to load music:', err);
      setError('Failed to load music: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-play the new song when selectedSong changes
  useEffect(() => {
    if (selectedSong) {
      console.log('Resetting audio element for new song:', selectedSong.title);

      // Pause and reset the current song
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ''; // Clear the previous source
        audioRef.current.load(); // Reset the audio element
      }

      setIsPlaying(false); // Reset the playing state
      setCurrentTime(0); // Reset the current time
      setDuration(0); // Reset the duration
      setError(''); // Clear any errors

      // Play the new song automatically
      handlePlayMusic();
    }
  }, [selectedSong]); // Trigger this effect when selectedSong changes

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    audioRef.current.volume = newVolume / 100;
  };

  const volumeToggle = () => {
    if (audioRef.current.volume !== 0) {
      setInitialVolume(audioRef.current.volume);
      audioRef.current.volume = 0;
      setVolume(0);
    } else {
      audioRef.current.volume = initialVolume;
      setVolume(initialVolume * 100);
    }
  };

  const handleTimeUpdate = () => {
    if (!seeking) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
    audioRef.current.volume = 0.5;
  };

  const handleSeekStart = () => {
    setSeeking(true);
  };

  const handleSeekEnd = (e) => {
    setSeeking(false);
    const seekTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleSeekMove = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    setCurrentTime(seekTime);
  };

  useEffect(() => {
    const audioElement = audioRef.current;
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [seeking]);

  return (
    <div className="music-player">
      <audio ref={audioRef} />

      <div>
        <img src={selectedSong ? `${SERVER_IP}/image/${selectedSong.id}.png` : logo} alt="" className="cover-image" />
      </div>
      <div className="song-info">
        <div className="song-name">{selectedSong ? selectedSong.title : 'No Song Selected'}</div>
        <div className="artist-name">{selectedSong ? selectedSong.artist : ''}</div>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="control-container">
        <div className="control-bar">
          <button className="control-button" disabled={isLoading}>
            <img src={previousButton} alt="" className="button-group" />
          </button>
          <button className="control-button" onClick={handlePlayMusic} disabled={isLoading}>
            <img
              src={isPlaying ? pauseButton : playButton}
              alt={isPlaying ? "pause" : "play"}
              className="button-group"
            />
          </button>
          <button className="control-button" disabled={isLoading}>
            <img src={NextButton} alt="" className="button-group" />
          </button>
        </div>
        <div className="status">
          <div className="music-status">
            {formatTime(currentTime)}
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={(currentTime / duration) * 100 || 0}
            onChange={handleSeekMove}
            onMouseDown={handleSeekStart}
            onMouseUp={handleSeekEnd}
            onTouchStart={handleSeekStart}
            onTouchEnd={handleSeekEnd}
            className="status-bar"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="volume-status">
        <button className='volume-button' onClick={volumeToggle} disabled={isLoading}>
          <img className="volume-image" src={volume == 0 ? Mute : (volume > 40 ? VolumeHigh : VolumeLow)} />
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-control-bar"
          disabled={isLoading}
        />
      </div>
    </div>
  );
}

export default MusicPlayer;