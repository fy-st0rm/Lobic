// Node modules
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import React, { useState } from "react";
import { Helmet } from "react-helmet";

// Routes
import Login from "routes/login/Login";
import Home from "routes/home/Home";
import Auth from "routes/auth/Auth";
import Signup from "routes/signup/Signup";
import ForgotPassword from "routes/login/ForgotPassword";
import Lobby from "routes/lobby/Lobby";
import Chats from "routes/chats/Chats";
import Playlist from "routes/playlist/Playlist";
import Playlists from "routes/playlists/playlists";
import Profile from "routes/profile/Profile";

import MusicPlayer from "components/MusicPlayer/MusicPlayer";
import NavBar from "components/NavBar/NavBar";

function App() {
	const location = useLocation(); // Get the current route location

	// List of routes where MusicPlayer should NOT be rendered
	const excludedRoutes = ["/login", "/signup", "/forgotpassword"];

	// Check if the current route is excluded
	const shouldRenderMusicPlayer = !excludedRoutes.includes(location.pathname);
	const shouldRenderNavBar = shouldRenderMusicPlayer;

	return (
		<div>
			<Helmet>
				<title> Lobic </title>
				<link rel="icon" href="public\lobic_logo.png" />
			</Helmet>

			{/* Globally rendering navbar */}
			{shouldRenderNavBar && <NavBar className="navbar" />}

			{/* Render MusicPlayer globally if the route is not excluded */}
			{shouldRenderMusicPlayer && <MusicPlayer />}

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
							<Home />
						</Auth>
					}
				/>
				<Route
					path="/lobby"
					element={
						<Auth>
							<Lobby key={location.pathname} />
						</Auth>
					}
				/>
				<Route
					path="/chats"
					element={
						<Auth>
							<Chats />
						</Auth>
					}
				/>
				{/* <Route
          path="/playlist"
          element={
            <Auth>
              <Playlist />
            </Auth>
          }
        /> */}
				<Route path="/playlist/:playlistId" element={<Playlist />} />

				<Route
					path="/playlists"
					element={
						<Auth>
							<Playlists />
						</Auth>
					}
				/>
				<Route
					path="/profile"
					element={
						<Auth>
							<Profile />
						</Auth>
					}
				/>
			</Routes>
		</div>
	);
}

export default App;
