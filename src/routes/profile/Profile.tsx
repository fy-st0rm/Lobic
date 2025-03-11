import React, { useEffect, useState } from "react";
import { UserRoundPlus, UserRoundX, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import {
	Notification,
	useNotificationProvider,
} from "providers/NotificationProvider";
import { useAppProvider } from "providers/AppProvider";
import { User, getUserData, searchUser, fetchUserPfp } from "api/user/userApi";
import { Friend, fetchFriends, addFriend, removeFriend } from "api/friendApi";
import { OpCode } from "api/socketApi";
import { MusicListsProvider } from "@/providers/MusicListContextProvider";
import { MusicTrack } from "@/api/music/musicApi";
import { fetchRecentlyPlayed } from "@/api/music/recentlyPlayedApi";
import Music from "../home/Music";
import ProfileCard from "./ProfileCard";

// Recently Played Music Container
const RecentlyPlayedMusicContainer: React.FC = () => {
	const { appState } = useAppProvider();
	const [musicItems, setMusicItems] = useState<MusicTrack[]>([]);

	useEffect(() => {
		const loadMusic = async () => {
			const data: MusicTrack[] = await fetchRecentlyPlayed(appState.user_id);
			setMusicItems(data);
		};
		loadMusic();
	}, [appState.user_id]);

	return (
		<MusicListsProvider>
			<div className="h-[658px] overflow-scroll no-scrollbar">
				<h2 className="text-white text-3xl font-bold mb-4 px-3">
					Recently Played
				</h2>
				<div className="flex flex-wrap overflow-hidden w-full">
					{musicItems.map((song) => (
						<Music
							musicId={song.id}
							title={song.title}
							artist={song.artist}
							album={song.album}
							image_url={song.image_url}
							onClick={() => {}}
						/>
					))}
				</div>
			</div>
		</MusicListsProvider>
	);
};

// Friend List Component
const FriendList: React.FC<{ friends: Friend[] }> = ({ friends }) => {
	return (
		<>
			<h3 className="text-white text-lg font-medium mb-3">Friends</h3>
			<div className="flex flex-col gap-3">
				{friends.length > 0 ? (
					friends.map((friend) => (
						<div key={friend.id} className="flex items-center gap-2">
							<img
								className="w-8 h-8 bg-gray-600 rounded-full"
								src={fetchUserPfp(friend.id)}
								alt={friend.name}
							/>
							<span className="text-white text-sm">{friend.name}</span>
						</div>
					))
				) : (
					<p className="text-gray-400 text-sm">No friends to display</p>
				)}
			</div>
		</>
	);
};

//Search List Component
interface SearchResultListProps {
	searchResult: User[];
	currentUserId: string;
	friends: Friend[];
	onAddFriend: (user: User) => void;
	onRemoveFriend: (user: User) => void;
	showSuggestions: boolean;
}
const SearchResultList: React.FC<SearchResultListProps> = ({
	searchResult,
	currentUserId,
	friends,
	onAddFriend,
	onRemoveFriend,
	showSuggestions,
}) => {
	if (!showSuggestions) return;

	return (
		<div className="absolute w-full mt-2 max-h-[490px] rounded-[5px] bg-hoverEffect text-black overflow-y-auto no-scrollbar">
			{searchResult.map((user) =>
				user.id !== currentUserId ? (
					<div
						key={user.id}
						className="p-3 rounded-[5px] cursor-pointer flex items-center justify-between bg-hoverEffect hover:bg-opacity-[10%] hover:bg-secondary"
					>
						<div className="flex items-center space-x-2">
							<img
								src={fetchUserPfp(user.pfp)}
								className="w-10 h-10 rounded-full"
								alt={user.username}
							/>
							<div className="overflow-x-auto no-scrollbar">
								{user.username}
							</div>
						</div>
						{friends.some((f) => f.id === user.id) ? (
							<button
								className="rounded-full p-2 hover:bg-secondary hover:bg-opacity-[20%]"
								onClick={() => onRemoveFriend(user)}
							>
								<UserRoundX />
							</button>
						) : (
							<button
								className="rounded-full p-2 hover:bg-secondary hover:bg-opacity-[20%]"
								onClick={() => onAddFriend(user)}
							>
								<UserRoundPlus />
							</button>
						)}
					</div>
				) : null,
			)}
		</div>
	);
};

// Main Profile Component
const Profile: React.FC = () => {
	const { appState } = useAppProvider();
	const { addTempNotif } = useNotificationProvider();
	const [inputValue, setInputValue] = useState<string>("");
	const [searchResult, setSearchResult] = useState<User[]>([]);
	const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

	// Fetch user data
	const [userData, setUserData] = useState<User>({
		id: "",
		username: "",
		email: "",
		pfp: "",
	});
	useEffect(() => {
		const fetchUser = async () => {
			try {
				const data: User = await getUserData(appState.user_id);
				setUserData(data);
			} catch (err) {
				console.error("Failed to fetch user data:", err);
			}
		};
		fetchUser();
	}, [appState.user_id]);

	// Fetch friends
	const [friends, setFriends] = useState<Friend[]>([]);
	useEffect(() => {
		const loadFriends = async () => {
			try {
				const friendList: Friend[] = await fetchFriends(userData.id);
				setFriends(friendList);
			} catch (err) {
				console.error("Failed to fetch friends:", err);
			}
		};
		loadFriends();
	}, [userData.id]);

	// Search users
	useEffect(() => {
		const searchUsers = async () => {
			if (!inputValue) {
				setSearchResult([]);
				setShowSuggestions(false);
				return;
			}
			const response = await searchUser(inputValue.trim(), 5);
			if (!response.ok) {
				console.error(`Search failed: ${await response.text()}`);
				return;
			}
			const data: { results: User[] } = await response.json();
			setSearchResult(data.results);
			setShowSuggestions(true);
		};
		searchUsers();
	}, [inputValue]);

	const handleAddFriend = (friend: User) => {
		addFriend(appState.user_id, friend.id)
			.then(() => {
				setFriends((prev) => [
					{ id: friend.id, name: friend.username },
					...prev,
				]);
				addTempNotif({
					id: uuidv4(),
					op_code: OpCode.OK,
					value: `@${friend.username} is now your friend.`,
				});
			})
			.catch((err) => console.error("Failed to add friend:", err));
	};

	const handleRemoveFriend = (friend: User) => {
		removeFriend(appState.user_id, friend.id)
			.then(() => {
				setFriends((prev) => prev.filter((f) => f.id !== friend.id));
				addTempNotif({
					id: uuidv4(),
					op_code: OpCode.OK,
					value: `@${friend.username} is not a friend anymore.`,
				});
			})
			.catch((err) => console.error("Failed to remove friend:", err));
	};

	return (
		<div className="flex flex-col w-full bg-primary">
			<div className="grid grid-cols-[4fr_1fr] gap-4 w-full">
				<div className="flex flex-col">
					<ProfileCard
						usertag={userData.email || "0 Playlist"}
						username={userData.username || "Unknown User"}
						friendcount={friends.length}
						user_uuid={userData.id}
					/>
					<RecentlyPlayedMusicContainer />
				</div>

				<div className="p-6 bg-secondary rounded-lg">
					<div className="relative">
						<div className="relative">
							<input
								type="text"
								className="w-full py-2 px-4 rounded-full border-none focus:outline-none bg-hoverEffect focus:bg-primary_fg text-primary text-sm"
								placeholder="Add Friend"
								value={inputValue}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setInputValue(e.target.value)
								}
							/>
							{inputValue && (
								<button
									className="absolute right-2 top-1/2 -translate-y-1/2"
									onClick={() => setInputValue("")}
								>
									<X className="text-primary" />
								</button>
							)}
						</div>
						<SearchResultList
							searchResult={searchResult}
							currentUserId={appState.user_id}
							friends={friends}
							onAddFriend={handleAddFriend}
							onRemoveFriend={handleRemoveFriend}
							showSuggestions={showSuggestions}
						/>
					</div>
					<FriendList friends={friends} />
				</div>
			</div>
		</div>
	);
};

export default Profile;
