// Node modules
import {
	BrowserRouter as Router,
	useLocation,
	Outlet,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { Helmet } from "react-helmet";

// Local
import { Auth, Verify, OTPVerify} from "routes/auth/Auth";
import SideBar from "@/components/SideBar/SideBar";
import MusicPlayer from "@/components/MusicPlayer/MusicPlayer";
import NavBar from "components/NavBar/NavBar";
import NotFound from "@/components/NotFound";
import ResultsPage from "@/routes/search/ResultsPage";
import Queue from "@/components/Queue/queue";

// Auth Pages
import Login from "routes/auth/Login";
import Signup from "routes/auth/Signup";
import OTP_Page from "routes/auth/OTP_Page";
import ForgotPassword from "routes/auth/ForgotPassword";
import ChangePassword from "routes/auth/ChangePassword";

// App Pages
import Home from "routes/home/Home";
import Lobby from "routes/lobby/Lobby";
import Chats from "@/routes/lobby/chats/Chats";
import Playlist from "routes/playlists/Playlist";
import Playlists from "@/routes/playlists/AllPlaylists";
import Profile from "routes/profile/Profile.tsx";
import AllSongsPage from "@/routes/home/allSongsPage/AllSongsPage";

// Layout of the app
const Layout = () => {
	return (
		<>
			<div className="flex flex-col w-screen h-screen overflow-hidden">
				<NavBar />
				<div className="flex flex-1 w-full overflow-hidden my-2">
					<SideBar />
					<div className="overflow-auto no-scrollbar mr-2 w-full h-full">
						<Outlet />
					</div>
					<Queue />
				</div>
				<MusicPlayer />
			</div>
		</>
	);
};

function App(): React.ReactElement {
	return (
		<>
			<Helmet>
				<title> Lobic </title>
				<link rel="icon" href="/navbar/LobicLogo.svg" />
			</Helmet>

			<Routes>
				<Route path="/" element={<Navigate to="/login" replace />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/otp_page/:route/:userId" element={<OTP_Page />} />
				<Route path="/forgotpassword" element={<ForgotPassword />} />

				<Route path="/changepassword" element={
					<OTPVerify>
						<ChangePassword />
					</OTPVerify>
				} />

				<Route
					element={
						<Auth>
							<Verify>
								<Layout />
							</Verify>
						</Auth>
					}
				>
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
		</>
	);
}

export default App;
