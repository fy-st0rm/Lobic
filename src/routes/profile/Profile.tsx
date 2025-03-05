// Node modules
import React, { useEffect, useState } from "react";
import { UserRoundPlus, X } from "lucide-react";

// Local
import ProfileCard from "./ProfileCard";
import PlaylistsContainer from "./PlaylistsContainer/PlaylistsContainer";
import { useAppProvider } from "providers/AppProvider";
import { User, getUserData, searchUser, fetchUserPfp } from "api/user/userApi";

interface Friend {
	id: string;
	name: string;
}

function Profile() {
	const { appState } = useAppProvider();

	const [inputValue, setInputValue] = useState<string>("");
	const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
	const [searchResult, setSearchResult] = useState<User[]>([]);

	// State for user data
	const [userData, setUserData] = useState<User>({
		id: "",
		username: "",
		email: "",
		pfp: "",
	});

	// State for friends list
	const [friends, setFriends] = useState<Friend[]>([
		{ id: "1", name: "Bijan" },
		{ id: "2", name: "Bijan" },
		{ id: "3", name: "Bijan" },
	]);

	const [loading, setLoading] = useState<boolean>(true);

	// Fetch user data on mount
	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const data = await getUserData(appState.user_id);
				setUserData(data);
			} catch (err) {
				console.error("Failed to fetch user data:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchUserData();
	}, [appState]);

	// Add friend handler
	const handleAddFriend = () => {
		const newFriendName = prompt("Enter the friend's name:");
		if (!newFriendName) return;

		// Simulate adding a new friend (API integration can be added here)
		const newFriend: Friend = {
			id: Date.now().toString(), // Generate a unique ID
			name: newFriendName,
		};

		setFriends((prevFriends) => [...prevFriends, newFriend]);
	};

	// Update user search
	useEffect(() => {
		const fetchUsers = async () => {
			if (inputValue.length <= 0) {
				setSearchResult([]);
				setShowSuggestions(false);
				return;
			}

			let response = await searchUser(inputValue.trim(), 5);
			if (!response.ok) {
				let msg = await response.text();
				console.error(`Search User failed: ${msg}`);
				return;
			}

			let data = await response.json();
			let results: User[] = data["results"];
			let final = Array.from({ length: 10 }, () => results).flat();
			setSearchResult(final);
			setShowSuggestions(true);
		};

		fetchUsers();
	}, [inputValue]);

	return (
		<div className="flex flex-col w-full bg-primary min-h-screen">
			<div className="grid grid-cols-[3fr_1fr] gap-4 w-full">
				<div className="flex flex-col">
					<div className="mb-8">
						<ProfileCard
							usertag={userData.email || "3 Playlist"}
							username={userData.username || "Sadit Rasaili"}
							friendcount={friends.length}
							user_uuid={userData.id}
						/>
					</div>

					<div className="px-6">
						<PlaylistsContainer />
					</div>
				</div>

				{/* Friends Section */}
				<div className="p-6 bg-secondary rounded-lg">

					<div className="relative">
						{/* User search bar */}
						<div className="relative">
							<input
								type="text"
								className="
									w-full py-2 px-4 rounded-full
									border-none focus:border-none focus:outline-none
									bg-hoverEffect focus:bg-primary_fg
									text-primary text-sm"
								placeholder="Add Friend"
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
							/>

							{/* Clear search button */}
							{inputValue &&
								<div className="
									absolute w-full h-full px-2 top-0
									flex items-center justify-center
								">
									<button
										className="ml-auto"
										onClick={() => setInputValue("")}
									>
										<X className="text-primary"/>
									</button>
								</div>
							}
						</div>

						{/* User search result */}
						{showSuggestions &&
							<div
								className="
									absolute w-full mt-2 max-h-[490px]
									rounded-[5px]
									bg-hoverEffect text-black
									overflow-y-auto no-scrollbar
								"
							>
								{searchResult.map((user, idx) => (
									<div
										className={`p-3 flex items-center justify-between rounded-[5px] cursor-pointer ${
											idx % 2 === 0 ? "bg-secondary bg-opacity-[30%] " : "bg-hoverEffect"
										} hover:bg-opacity-[50%] hover:bg-secondary`}
									>
										<div className="flex items-center space-x-2">
											<img src={fetchUserPfp(user.pfp)} className="w-10 h-10 rounded-full" />
											<div className="overflow-x-auto no-scrollbar">{user.username}</div>
										</div>

										<button>
											<UserRoundPlus />
										</button>
									</div>
								))}
							</div>
						}
					</div>

					<h3 className="text-white text-lg font-bold mt-6 mb-4">Friends</h3>
					<div className="flex flex-col gap-3">
						{friends.map((friend) => (
							<div key={friend.id} className="flex items-center gap-2">
								<div className="w-8 h-8 bg-gray-600 rounded-full"></div>
								<span className="text-white text-sm">{friend.name}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default Profile;
