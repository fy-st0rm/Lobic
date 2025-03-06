// Node modules
import React, { useEffect, useState } from "react";
import { UserRoundPlus, UserRoundX, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Local
import { Notification, useNotificationProvider } from "providers/NotificationProvider";
import ProfileCard from "./ProfileCard";
import PlaylistsContainer from "./PlaylistsContainer/PlaylistsContainer";
import { useAppProvider } from "providers/AppProvider";
import { User, getUserData, searchUser, fetchUserPfp } from "api/user/userApi";
import { Friend, fetchFriends, addFriend, removeFriend } from "api/friendApi";
import { OpCode } from "api/socketApi";
import MusicList from "@/routes/home/MusicList";
import { useMusicProvider } from "@/providers/MusicProvider";
import { MusicListsProvider } from "@/providers/MusicListContextProvider";

function Profile() {
	const { appState } = useAppProvider();
	const { addTempNotif } = useNotificationProvider();

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
	const [friends, setFriends] = useState<Friend[]>([]);
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

	// Fetch friends on mount
	useEffect(() => {
		const initFriends = async () => {
			try {
				let friend_list = await fetchFriends(userData.id);
				setFriends(friend_list);
			} catch (err) {
				console.error(err);
			}
		};
		initFriends();
	}, [userData]);

	// Add friend handler
	const handleAddFriend = (friend: User) => {
		try {
			addFriend(appState.user_id, friend.id)
		} catch (err) {
			console.error(err);
		} finally {
			let notif: Notification = {
				id: uuidv4(),
				op_code: OpCode.OK,
				value: `${friend.username} is now your friend.`,
			};
			addTempNotif(notif);

			// Adding to the friends list
			setFriends((prevFriends) => {
				let newFriend = {
					id: friend.id,
					name: friend.username,
				};

				let newFriends = [newFriend, ...prevFriends];
				return newFriends;
			});
		}
	};

	// Remove friend handler
	const handleRemoveFriend = (friend: User) => {
		try {
			removeFriend(appState.user_id, friend.id)
		} catch (err) {
			console.error(err);
		} finally {
			let notif: Notification = {
				id: uuidv4(),
				op_code: OpCode.OK,
				value: `${friend.username} is not a friend anymore.`,
			};
			addTempNotif(notif);

			// Removing from the friends list
			setFriends(prevFriends =>
				prevFriends.filter(f => f.id !== friend.id)
			);
		}
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
			setSearchResult(results);
			setShowSuggestions(true);
		};

		fetchUsers();
	}, [inputValue]);

	return (
		<div className="flex flex-col w-full bg-primary">
			<div className="grid grid-cols-[4fr_1fr] gap-4 w-full">
				<div className="flex flex-col">
					<div className="mb-8">
						<ProfileCard
							usertag={userData.email || "3 Playlist"}
							username={userData.username || "Sadit Rasaili"}
							friendcount={friends.length}
							user_uuid={userData.id}
						/>
					</div>

					<div className=" h-[658px] overflow-scroll no-scrollbar" >
						<MusicListsProvider>
						<PlaylistsContainer />
						</MusicListsProvider>
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
									pointer-events-none
								">
									<button
										className="ml-auto pointer-events-auto"
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
										className="
											p-3 rounded-[5px] cursor-pointer
											flex items-center justify-between
											bg-hoverEffect hover:bg-opacity-[10%] hover:bg-secondary
										"
									>
										<div className="flex items-center space-x-2">
											<img src={fetchUserPfp(user.pfp)} className="w-10 h-10 rounded-full" />
											<div className="overflow-x-auto no-scrollbar">{user.username}</div>
										</div>

										{user.id !== appState.user_id &&
											<button
												className="
													rounded-full p-2
													hover:bg-secondary hover:bg-opacity-[20%]
												"
												onClick={
													friends.some(friend => friend.id === user.id) ?
													() => handleRemoveFriend(user) :
													() => handleAddFriend(user)
												}
											>
												{ // Display add friend or remove friend icon
													friends.some(friend => friend.id === user.id) ?
													<UserRoundX /> : <UserRoundPlus/>
												}
											</button>
										}
									</div>
								))}
							</div>
						}
					</div>

					<h3 className="text-white text-lg font-bold mt-6 mb-4">Friends</h3>
					<div className="flex flex-col gap-3">
						{friends.map((friend) => (
							<div key={friend.id} className="flex items-center gap-2">
								<img
									className="w-8 h-8 bg-gray-600 rounded-full"
									src={fetchUserPfp(friend.id)}
								/>
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
