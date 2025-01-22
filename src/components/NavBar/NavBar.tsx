// Node modules
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

// Local
import SearchBar from "components/SearchBar/SearchBar";
import { OpCode, wsSend } from "api/socketApi.ts";
import { fetchUserProfilePicture, logoutUser } from "api/userApi.ts";
import { useAppProvider } from "providers/AppProvider";
import { useSocketProvider } from "providers/SocketProvider";
import { useLobbyProvider } from "providers/LobbyProvider";

// Assets
import "./NavBar.css";

function NavBar() {
	const [showMessage, setShowMessage] = useState<boolean>(false);
	const [isDisabled, setIsDisabled] = useState<boolean>(false);
	const [inputValue, setInput] = useState<string>("");
	const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);
	const [profilePic, setProfilePic] = useState<string>("/public/sadit.jpg");

	const { appState } = useAppProvider();
	const { getSocket } = useSocketProvider();
	const { lobbyState } = useLobbyProvider();

	const user_id = appState.user_id;

	const navigate = useNavigate();

	useEffect(() => {
		const loadProfilePicture = async () => {
			if (user_id) {
				const picturePath = await fetchUserProfilePicture(user_id);
				setProfilePic(picturePath);
			}
		};

		loadProfilePicture();
	}, [user_id]);

	const handleLogoutClick = () => {
		setShowMessage(true);
		setIsDisabled(true);
	};

	const handleLogoutConfirm = async () => {
		try {
			setShowMessage(false);
			setIsDisabled(false);

			// If the client is in lobby then leave it
			if (lobbyState.in_lobby) {
				const payload = {
					op_code: OpCode.LEAVE_LOBBY,
					value: {
						lobby_id: lobbyState.lobby_id,
						user_id: appState.user_id,
					},
				};
				wsSend(getSocket(), payload);
			}

			await logoutUser(appState.user_id);

			// Clearing the session storage
			sessionStorage.clear();
			// navigate("/login");
			window.location.href = "/login";
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const handleLogoutCancel = () => {
		setShowMessage(false);
		setIsDisabled(false);
	};

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInput(event.target.value);
	};

	const handleClearButton = () => {
		setInput("");
	};

	const toggleDashboard = () => {
		setIsDashboardOpen(!isDashboardOpen);
	};

	const closeDashboard = () => {
		setIsDashboardOpen(false);
	};

	const navigateAndClose = (url: string) => {
		closeDashboard();
		navigate(url);
	};

	return (
		<>
			<div className="navbar">
				<div className="blur"></div>
				<div className="logo-container">
					<Link to="/home" className={isDisabled ? "disabled-link" : ""}>
						<img src="./public/lobic_logo.png" className="logo" alt="Logo" />
					</Link>
				</div>

				<ul className="navbar-items">
					<li>
						<Link
							to="/home"
							className={`navbar-link ${isDisabled ? "disabled-link" : ""}`}
						>
							<img
								className="navbar-home"
								src="./public/home.png"
								alt="Home Icon"
							/>
						</Link>
					</li>
					<li>
						<Link
							to="/lobby"
							className={`navbar-link ${isDisabled ? "disabled-link" : ""}`}
						>
							<img
								className="navbar-icons"
								src="./public/people.png"
								alt="Friends Icon"
							/>
						</Link>
					</li>
					<li>
						<Link
							to="/playlists"
							className={`navbar-link ${isDisabled ? "disabled-link" : ""}`}
						>
							<img
								className="navbar-icons"
								src="./public/playlist.png"
								alt="Playlist Icon"
							/>
						</Link>
					</li>
					<li>
						<Link
							to="/notifications"
							className={`navbar-link ${isDisabled ? "disabled-link" : ""}`}
						>
							<img
								className="navbar-bell"
								src="./public/bell.png"
								alt="Notifications Icon"
							/>
						</Link>
					</li>
				</ul>

				<SearchBar isDisabled={isDisabled} onClearInput={handleClearButton} />

				<div className="user-icon">
					<button
						className="profile-button"
						onClick={() => navigateAndClose("/profile")}
					>
						<img src={profilePic} className="profile-pic" alt="Profile" />
					</button>
				</div>

				<div className="logout">
					<button
						className="logout-button"
						onClick={handleLogoutClick}
						disabled={isDisabled}
						style={{ pointerEvents: isDisabled ? "none" : "auto" }}
					>
						<img
							className="navbar-button"
							src="./public/logout.png"
							alt="Logout"
						/>
					</button>
				</div>

				<div className="hamburger">
					<button
						className="hamburger-button"
						style={{ pointerEvents: isDisabled ? "none" : "auto" }}
						onClick={toggleDashboard}
					>
						<img
							src="./public/hamburger.png"
							className="hamburger-icon"
							alt="Hamburger"
						/>
					</button>
				</div>

				{isDashboardOpen && (
					<>
						<div className="overlay" onClick={closeDashboard}></div>
						<div className="dashboard open">
							<div className="dashboard-content">
								<h2>Dashboard</h2>
								<button
									className="dashboard-buttons"
									onClick={() => navigateAndClose("/home")}
								>
									Home
								</button>
								<button
									className="dashboard-buttons"
									onClick={() => navigateAndClose("/playlists")}
								>
									Playlists
								</button>
								<button
									className="dashboard-buttons"
									onClick={() => navigateAndClose("/notifications")}
								>
									Notifications
								</button>
								<button
									className="dashboard-buttons"
									onClick={() => navigateAndClose("/lobby")}
								>
									Lobby
								</button>
								<button
									className="dashboard-buttons"
									onClick={() => navigateAndClose("/profile")}
								>
									Profile
								</button>
							</div>
						</div>
					</>
				)}
			</div>

			{showMessage && (
				<div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex justify-center items-center z-50">
					<div className="bg-black bg-opacity-90 p-8 rounded-xl shadow-lg max-w-md w-full">
						<h2 className="text-2xl font-semibold text-white mb-6 text-center">
							Confirm Logout
						</h2>
						<p className="text-gray-300 mb-6 text-center">
							Are you sure you want to logout?
						</p>
						<div className="flex justify-center space-x-4">
							<button
								className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full transition duration-300 transform hover:scale-105 outline-none focus:outline-none border-none focus:ring-0 focus:shadow-none"
								onClick={handleLogoutConfirm}
							>
								Confirm
							</button>
							<button
								className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300 transform hover:scale-105 outline-none focus:outline-none border-none focus:ring-0 focus:shadow-none"
								onClick={handleLogoutCancel}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

export default NavBar;
