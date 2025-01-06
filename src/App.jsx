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
import Profile from "./routes/profile/profile.jsx";
import MusicPlayer from './components/MusicPlayer/MusicPlayer.jsx';
import NavBar from './components/NavBar/NavBar.jsx';
import { useAppState } from "./AppState.jsx";

function App() {
	const location = useLocation(); // Get the current route location

	// List of routes where MusicPlayer should NOT be rendered
	const excludedRoutes = ['/login', '/signup', '/forgotpassword'];

	// Check if the current route is excluded
	const shouldRenderMusicPlayer = !excludedRoutes.includes(location.pathname);
	const shouldRenderNavBar = shouldRenderMusicPlayer;

	return (
		<div>
			{/* Globally rendering navbar */}
			{ shouldRenderNavBar && <NavBar className="navbar" /> }

			{/* Render MusicPlayer globally if the route is not excluded */}
			{ shouldRenderMusicPlayer && <MusicPlayer/> }

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
							<Home/>
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
				<Route 
					path="/playlist" 
					element={	
						<Auth>
							<Playlist />
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
