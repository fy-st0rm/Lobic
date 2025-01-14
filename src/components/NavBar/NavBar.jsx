import React, { useState, useEffect } from "react";
import "./NavBar.css";
import { useNavigate, Link } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
import { useAppState } from "../../AppState.jsx";
import { SERVER_IP, OpCode, wsSend } from "../../const.jsx";

function NavBar() {
	const [showMessage, setShowMessage] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false);
	const [inputValue, setInput] = useState("");
	const [isDashboardOpen, setIsDashboardOpen] = useState(false);
	const [profilePic, setProfilePic] = useState("/public/sadit.jpg"); // Default image
	const { appState, ws } = useAppState();
	const user_id = appState.user_id;

	const navigate = useNavigate();

	// Fetch the user's profile picture
	useEffect(() => {
		const fetchProfilePicture = async () => {
			try {
				const response = await fetch(
					`${SERVER_IP}/user/get_pfp/${user_id}.png`,
				);
				if (response.ok) {
					// If the image exists, use it
					setProfilePic(`${SERVER_IP}/user/get_pfp/${user_id}.png`);
				} else {
					// If the image doesnt exist, fall back to the default image
					setProfilePic("/public/sadit.jpg");
				}
			} catch (error) {
				setProfilePic("/public/sadit.jpg"); // Fall back to the default image
				console.error("Error fetching profile picture:", error);
			}
		};

		if (user_id) {
			fetchProfilePicture();
		}
	}, [user_id]);

	const handleLogoutClick = () => {
		setShowMessage(true);
		setIsDisabled(true);
	};

	const handleLogoutConfirm = async () => {
		setShowMessage(false);
		setIsDisabled(false);

		// If the client is in lobby then leave it
		if (appState.in_lobby) {
			const payload = {
				op_code: OpCode.LEAVE_LOBBY,
				value: {
					lobby_id: appState.lobby_id,
					user_id: appState.user_id,
				},
			};
			wsSend(ws, payload);
		}

		const payload = {
			user_id: appState.user_id,
		};

		let response = await fetch(`${SERVER_IP}/logout`, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		// TODO: Currently not caring about the fetch errors

		// Clearing the session storage
		sessionStorage.clear();

		navigate("/login");
	};

	const handleLogoutCancel = () => {
		setShowMessage(false);
		setIsDisabled(false);
	};

	const handleInputChange = (event) => {
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

	const navigateAndClose = (url) => {
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

				<SearchBar
					isDisabled={isDisabled}
					inputValue={inputValue}
					onInputChange={handleInputChange}
					onClearInput={handleClearButton}
				/>

				<div className="user-icon">
					<button
						className="profile-button"
						onClick={() => {
							navigateAndClose("/profile");
						}}
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
				<div className="floating-message">
					<p>Are you sure you want to logout?</p>
					<div className="button-group">
						<button className="confirm-button" onClick={handleLogoutConfirm}>
							Confirm
						</button>
						<button className="cancel-button" onClick={handleLogoutCancel}>
							Cancel
						</button>
					</div>
				</div>
			)}
		</>
	);
}

export default NavBar;
