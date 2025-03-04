// Node modules
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

// Local
import SearchBar from "@/components/Search/SearchBar";
import { OpCode, wsSend } from "api/socketApi.ts";
import { fetchUserProfilePicture, logoutUser } from "@/api/user/userApi";
import { useAppProvider } from "providers/AppProvider";
import { useSocketProvider } from "providers/SocketProvider";
import { useLobbyProvider } from "providers/LobbyProvider";
import { NotificationDropDown } from "components/Notification/Notification";

// Assets
import Logo from "/navbar/LobicLogo.svg";
import Notification from "/navbar/notification.svg";
import Profile from "/navbar/profile.svg";
import "./NavBar.css";

function NavBar() {
	const { appState } = useAppProvider();
	const { getSocket } = useSocketProvider();
	const { lobbyState } = useLobbyProvider();

	const [showMessage, setShowMessage] = useState<boolean>(false);
	const [isDisabled, setIsDisabled] = useState<boolean>(false);
	const [inputValue, setInput] = useState<string>("");
	const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);
	const [profilePic, setProfilePic] = useState<string>("/sadit.jpg");
	const [profileDropdown, setProfileDropdown] = useState<boolean>(false);
	const [notifDropdown, setNotifDropdown] = useState<boolean>(false);
	const notifButtonRef = useRef<HTMLDivElement | null>(null);

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

	const handleProfileDropdown = () => {
		setProfileDropdown(!profileDropdown);
	};
	const closeProfileDropdown = () => {
		setProfileDropdown(false);
	};

	const toggleNotifDropdown = () => {
		setNotifDropdown(!notifDropdown);
		if (profileDropdown) {
			setProfileDropdown(false);
		}
	};

	const closeNotifDropdown = (event: MouseEvent) => {
		if (!notifButtonRef.current) return;
		if (notifButtonRef.current.contains(event.target as Node)) return;
		setNotifDropdown(false);
	};

	return (
		<>
			<div className="flex justify-between p-2">
				<div className="logo-container">
					<Link to="/home" className="no-underline text-primary_fg">
						<div className="flex gap-2">
							<img src={Logo} className="logo h-[45px] w-[45px]" alt="Logo" />
							<div className="self-center mt-2 font-semibold text-lg">
								Lobic
							</div>
						</div>
					</Link>
				</div>

				<SearchBar isDisabled={isDisabled} onClearInput={handleClearButton} />

				<div className="flex items-center gap-3">
					<div ref={notifButtonRef} onClick={toggleNotifDropdown}>
						<img
							className="navbar-bell  h-8 w-8 m-2 opacity-70 hover:opacity-100 transition-all"
							src={Notification}
							alt="Notifications Icon"
						/>
					</div>
					<div>
						<div onClick={() => handleProfileDropdown()}>
							<img
								src={Profile}
								className="profile-pic  h-8 w-8 opacity-70 hover:opacity-100 transition-all cursor-pointer "
								alt="Profile"
							/>
						</div>
					</div>

					<div className="hamburger">
						<button
							className="hamburger-button"
							style={{ pointerEvents: isDisabled ? "none" : "auto" }}
							onClick={toggleDashboard}
						>
							<img
								src="/hamburger.png"
								className="hamburger-icon"
								alt="Hamburger"
							/>
						</button>
					</div>
				</div>

				{/* Dropdowns */}

				{profileDropdown && (
					<div className="fixed top-16 right-5 w-32 h-24 bg-secondary z-50 rounded-md shadow-md shadow-gray-900" >
						<div
							className="p-2 px-4 pt-3 m-1 text-primary_fg rounded-sm hover:bg-hoverEffect hover:bg-opacity-10 transition-all"
							onClick={() => {
								navigate("/profile");
								closeProfileDropdown();
							}}
						>
							Profile
						</div>
						<div
							className="p-2 px-4 pt-3 m-1 text-primary_fg rounded-sm hover:bg-hoverEffect hover:bg-opacity-10 transition-all"
							onClick={() => {
								handleLogoutClick();
								closeProfileDropdown();
							}}
						>
							Logout
						</div>
					</div>
				)}
				<NotificationDropDown
					isOpen={notifDropdown}
					close={closeNotifDropdown}
				/>

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
				<div className="fixed top-0 left-0 w-full h-full bg-primary bg-opacity-80 flex justify-center items-center z-50">
					<div className="bg-secondary bg-opacity-98 p-8 rounded-xl shadow-lg max-w-md w-full">
						<h2 className="text-2xl font-semibold text-white mb-6 text-center">
							Confirm Logout
						</h2>
						  {/* Message */}
  <p className="text-gray-300 mb-6 text-center">
    Are you sure you want to logout?
  </p>

  {/* Buttons */}
  <div className="flex justify-center space-x-4">
    <button
      className="bg-button hover:bg-button_hover text-white font-semibold py-2 px-6 rounded-full transition duration-300 transform hover:scale-105"
      onClick={handleLogoutConfirm}
    >
      Confirm
    </button>
    <button
      className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300 transform hover:scale-105"
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
