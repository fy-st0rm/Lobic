import { Routes, Route, useLocation } from "react-router-dom";
import Auth from "routes/auth/Auth";
import Home from "routes/home/Home";
import Lobby from "routes/lobby/Lobby";
import Chats from "routes/chats/Chats";
import Playlist from "routes/playlists/Playlist";
import Playlists from "routes/playlists/playlists";
import Profile from "routes/profile/Profile.tsx";
import AllSongsPage from "routes/allSongsPage/AllSongsPage";
import NavBar from "components/NavBar/NavBar";
import MusicPlayer from "@/components/MusicPlayer/MusicPlayer";

function AppRoutes() {
	const location = useLocation();

	return (
		<Auth>
			<NavBar />
			<Routes>
				<Route path="/show_all" element={<AllSongsPage />} />
				<Route path="/playlist/:playlistId" element={<Playlist />} />
				<Route path="/home" element={<Home />} />
				<Route path="/lobby" element={<Lobby />} />
				<Route path="/chats" element={<Chats />} />
				<Route path="/playlists" element={<Playlists />} />
				<Route path="/profile" element={<Profile />} />
			</Routes>
			<MusicPlayer />
		</Auth>
	);
}

export default AppRoutes;
