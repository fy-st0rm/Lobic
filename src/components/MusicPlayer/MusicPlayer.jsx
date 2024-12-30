import React, { useRef, useState, useEffect } from 'react';
import previousButton from "/controlbar/PreviousButton.svg"
import playButton from "/controlbar/ButtonPlay.svg"
import pauseButton from "/controlbar/ButtonPause.svg"
import NextButton from "/controlbar/ButtonNext.svg"
import VolumeLow from "/volumecontrols/Volume Level Low.png"
import Mute from "/volumecontrols/Volume Mute.png"
import VolumeHigh from "/volumecontrols/Volume Level High.png"
import logo from "/covers/cover.jpg";
import song from "/music/song.mp3";
import "./MusicPlayer.css"

function MusicPlayer(){
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [initialVolume, setinitialVolume] = useState(volume);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  const PlayMusic = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    audioRef.current.volume = newVolume / 100;
  }
  const volumeToggle = () =>{
    if (audioRef.current.volume != 0){
      setinitialVolume
(audioRef.current.volume)
      audioRef.current.volume = 0;
      setVolume(0);
      
    }else{
      audioRef.current.volume = initialVolume
;
      setVolume(initialVolume
  *100);

    }
  }

  const handleTimeUpdate = () => {
    // Only update current time if not seeking
    if (!seeking) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
    
    audioRef.current.volume = 0.5;
  }

  const handleSeekStart = () => {
    setSeeking(true);
  }

  const handleSeekEnd = (e) => {
    setSeeking(false);
    const seekTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  }

  const handleSeekMove = (e) => {
    // Only update visual progress while seeking
    const seekTime = (e.target.value / 100) * duration;
    setCurrentTime(seekTime);
  }

  useEffect(() => {
    const audioElement = audioRef.current;
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [seeking]);

  return(
    <div className="music-player">
      <audio 
        ref={audioRef} 
        src={song} 
      />

      <div>
        <img src={logo} alt="" className="cover-image"/>
      </div>
      <div className="song-info">
        <div className="song-name">Pretty Boy</div>
        <div className="artist-name">The Neighbourhood</div>
      </div>
      <div className="control-container">
        <div className="control-bar">
          <button className="control-button"><img src={previousButton} alt="" className="button-group" /></button>
          <button className="control-button" onClick={PlayMusic}>
            <img 
              src={isPlaying ? pauseButton : playButton} 
              alt={isPlaying ? "pause" : "play"} 
              className="button-group"
            />
          </button>
          <button className="control-button"><img src={NextButton} alt="" className="button-group"/></button>
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
          />
        </div>
      </div>
      
      <div className="volume-status">
        <button className='volume-button' onClick={volumeToggle}><img  className = "volume-image" src={volume == 0? Mute : (volume > 40 ? VolumeHigh :VolumeLow)} /></button>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={volume}
          onChange={handleVolumeChange}
          className="volume-control-bar"
        />
       
      </div>
    </div>
  );
}

export default MusicPlayer;