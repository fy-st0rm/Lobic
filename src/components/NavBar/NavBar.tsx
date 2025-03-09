import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import SearchBar from "@/routes/search/SearchBar";
import { OpCode, wsSend } from "api/socketApi.ts";
import { fetchUserProfilePicture, logoutUser } from "@/api/user/userApi";
import { AppState, useAppProvider } from "providers/AppProvider";
import { useSocketProvider } from "providers/SocketProvider";
import { useLobbyProvider } from "providers/LobbyProvider";
import { NotificationDropDown } from "components/Notification/Notification";
import Logo from "/navbar/LobicLogo.svg";
import Notification from "/navbar/notification.svg";
import Profile from "/navbar/profile.svg";

// Logo Component
const LogoSection: React.FC = () => (
	<div className="block flex items-center mr-">
		<Link to="/home" className="no-underline text-primary_fg">
			<div className="flex gap-2">
				<img src={Logo} className=" h-[45px] w-[45px]" alt="Logo" />
				<div className="self-center mt-2 font-semibold text-lg">Lobic</div>
			</div>
		</Link>
	</div>
);

// Navigation Icons Component
const NavIcons: React.FC<{
	toggleNotifDropdown: () => void;
	handleProfileDropdown: () => void;
	notifButtonRef: React.RefObject<HTMLDivElement>;
}> = ({ toggleNotifDropdown, handleProfileDropdown, notifButtonRef }) => (
	<div className="flex items-center gap-3">
		<div ref={notifButtonRef} onClick={toggleNotifDropdown}>
			<img
				className="h-8 w-8 m-2 opacity-70 hover:opacity-100 transition-all"
				src={Notification}
				alt="Notifications Icon"
			/>
		</div>
		<div onClick={handleProfileDropdown}>
			<img
				src={Profile}
				className="h-8 w-8 opacity-70 hover:opacity-100 transition-all cursor-pointer"
				alt="Profile"
			/>
		</div>
	</div>
);

// Profile Dropdown Component
const ProfileDropdown: React.FC<{
	profileDropdown: boolean;
	closeProfileDropdown: () => void;
	navigate: (url: string) => void;
	handleLogoutClick: () => void;
}> = ({ profileDropdown, closeProfileDropdown, navigate, handleLogoutClick }) =>
	profileDropdown && (
		<div className="fixed top-16 right-5 w-32 h-24 bg-secondary z-50 rounded-md shadow-md shadow-gray-900">
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
	);

// Logout Modal Component
const LogoutModal: React.FC<{
	showMessage: boolean;
	handleLogoutConfirm: () => void;
	handleLogoutCancel: () => void;
}> = ({ showMessage, handleLogoutConfirm, handleLogoutCancel }) =>
	showMessage && (
		<div className="fixed top-0 left-0 w-full h-full bg-primary bg-opacity-80 flex justify-center items-center z-50">
			<div className="bg-secondary bg-opacity-98 p-8 rounded-xl shadow-lg max-w-md w-full">
				<h2 className="text-2xl font-semibold text-white mb-6 text-center">
					Confirm Logout
				</h2>
				<p className="text-gray-300 mb-6 text-center">
					Are you sure you want to logout?
				</p>
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
	);

// Main NavBar Component
const NavBar: React.FC = () => {
	const { appState } = useAppProvider();
	const { getSocket } = useSocketProvider();
	const { lobbyState } = useLobbyProvider();
	const navigate = useNavigate();

	const [showMessage, setShowMessage] = useState<boolean>(false);
	const [isDisabled, setIsDisabled] = useState<boolean>(false);
	const [inputValue, setInput] = useState<string>("");
	const [profilePic, setProfilePic] = useState<string>("/sadit.jpg");
	const [profileDropdown, setProfileDropdown] = useState<boolean>(false);
	const [notifDropdown, setNotifDropdown] = useState<boolean>(false);
	const notifButtonRef = useRef<HTMLDivElement>(null);

	const user_id = appState.user_id;

	useEffect(() => {
		const loadProfilePicture = async (): Promise<void> => {
			if (user_id) {
				const picturePath = await fetchUserProfilePicture(user_id);
				setProfilePic(picturePath);
			}
		};
		loadProfilePicture();
	}, [user_id]);

	const handleLogoutClick = (): void => {
		setShowMessage(true);
		setIsDisabled(true);
	};

	const handleLogoutConfirm = async (): Promise<void> => {
		try {
			setShowMessage(false);
			setIsDisabled(false);

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

			if (appState.user_id) await logoutUser(appState.user_id);

			sessionStorage.clear();
			window.location.href = "/login";
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const handleLogoutCancel = (): void => {
		setShowMessage(false);
		setIsDisabled(false);
	};

	const handleInputChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	): void => setInput(event.target.value);

	const handleClearButton = (): void => setInput("");

	const handleProfileDropdown = (): void =>
		setProfileDropdown(!profileDropdown);

	const closeProfileDropdown = (): void => setProfileDropdown(false);

	const toggleNotifDropdown = (): void => {
		setNotifDropdown(!notifDropdown);
		if (profileDropdown) {
			setProfileDropdown(false);
		}
	};

	const closeNotifDropdown = (event: MouseEvent): void => {
		if (!notifButtonRef.current) return;
		if (notifButtonRef.current.contains(event.target as Node)) return;
		setNotifDropdown(false);
	};

	return (
		<>
			<div className="flex justify-between p-2">
				<LogoSection />
				<SearchBar isDisabled={isDisabled} onClearInput={handleClearButton} />
				<NavIcons
					toggleNotifDropdown={toggleNotifDropdown}
					handleProfileDropdown={handleProfileDropdown}
					notifButtonRef={notifButtonRef}
				/>
				<ProfileDropdown
					profileDropdown={profileDropdown}
					closeProfileDropdown={closeProfileDropdown}
					navigate={navigate}
					handleLogoutClick={handleLogoutClick}
				/>
				<NotificationDropDown
					isOpen={notifDropdown}
					close={closeNotifDropdown}
				/>
			</div>
			<LogoutModal
				showMessage={showMessage}
				handleLogoutConfirm={handleLogoutConfirm}
				handleLogoutCancel={handleLogoutCancel}
			/>
		</>
	);
};

export default NavBar;
