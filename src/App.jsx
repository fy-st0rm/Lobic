import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { useState } from 'react';

import Login from './routes/login/Login.jsx';
import Home from "./routes/home/Home.jsx";
import Auth from "./routes/auth/Auth.jsx";
import Signup from './routes/signup/Signup.jsx';
import ForgotPassword from './routes/login/ForgotPassword.jsx';
import Lobby from "./routes/lobby/Lobby.jsx";
import Chats from "./routes/chats/Chats.jsx";
import Playlist from "./routes/playlist/Playlist.jsx";
import MusicPlayer from './components/MusicPlayer/MusicPlayer.jsx';
import NavBar from './components/NavBar/NavBar.jsx';

function App() {
  const [selectedSong, setSelectedSong] = useState(null); // State for selected song
  const [isPlaying, setIsPlaying] = useState(false); // State for play/pause
  const location = useLocation(); // Get the current route location

  // Handler for when a song is clicked
  const handleSongClick = (song) => {
    setSelectedSong(song); // Update selected song
  };

  // Handler for play/pause
  const handlePlayPause = (playing) => {
    setIsPlaying(playing);
  };

  // List of routes where MusicPlayer should NOT be rendered
  const excludedRoutes = ['/login', '/signup', '/forgotpassword'];

  // Check if the current route is excluded
  const shouldRenderMusicPlayer = !excludedRoutes.includes(location.pathname);

  return (
    <div>
      {/* Render MusicPlayer globally if the route is not excluded */}
      {shouldRenderMusicPlayer && (
        <MusicPlayer
          selectedSong={selectedSong}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
        />
      )}

      {/* Routes */}
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <Auth>
              <Home onSongClick={handleSongClick} />
            </Auth>
          }
        />
        <Route
          path="/lobby"
          element={
            <Auth>
              <Lobby key={location.pathname} onSongClick={handleSongClick} />
            </Auth>
          }
        />
        <Route path="/chats" element={<Chats />} />
        <Route path="/playlist" element={<Playlist />} />
      </Routes>
    </div>
  );
}

export default App;