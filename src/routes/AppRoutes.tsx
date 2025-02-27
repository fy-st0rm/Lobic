import { Routes, Route, useLocation, Outlet } from "react-router-dom";
import { Auth, Verify } from "routes/auth/Auth";
import Home from "routes/home/Home";
import Lobby from "routes/lobby/Lobby";
import Chats from "@/routes/lobby/chats/Chats";
import Playlist from "routes/playlists/Playlist";
import Playlists from "routes/playlists/playlists";
import Profile from "routes/profile/Profile.tsx";
import AllSongsPage from "@/routes/home/allSongsPage/AllSongsPage";
import NavBar from "components/NavBar/NavBar";
import MusicPlayer from "@/components/MusicPlayer/MusicPlayer";
import SideBar, { SidebarProvider } from "@/components/SideBar/SideBar";
import NotFound from "@/components/NotFound";
import ResultsPage from "@/components/Search/ResultsPage";
import Queue from "@/components/Queue/queue";

const Layout = () => {
	return (
		<>
			<div className="flex flex-col w-screen h-screen overflow-hidden">
				<NavBar />
				<div className="flex flex-1 w-full overflow-hidden my-2">
					<SideBar />
					<div className="overflow-auto no-scrollbar mr-3 w-full h-full">
						<Outlet />
					</div>
					<Queue/>
				</div>
				<MusicPlayer />
			</div>
		</>
	);
};

function AppRoutes() {
	const location = useLocation();

	return (
		<Auth>
			<Verify>
				<SidebarProvider>
					<Routes>
						{/* Main app routes with layout */}
						<Route element={<Layout />}>
							<Route path="/show_all" element={<AllSongsPage />} />
							<Route path="/playlist/:playlistId" element={<Playlist />} />
							<Route path="/home" element={<Home />} />
							<Route path="/lobby" element={<Lobby />} />
							<Route path="/chats" element={<Chats />} />
							<Route path="/playlists" element={<Playlists />} />
							<Route path="/profile" element={<Profile />} />
							<Route path="/results" element={<ResultsPage />} />
						</Route>

						{/* NotFound route without layout */}
						<Route path="*" element={<NotFound />} />
					</Routes>
				</SidebarProvider>
			</Verify>
		</Auth>
	);
}

export default AppRoutes;
