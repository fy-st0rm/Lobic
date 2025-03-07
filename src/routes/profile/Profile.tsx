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
		<div>
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
	);
};

// Friend Item Component
interface FriendItemProps {
	friend: Friend;
}
const FriendItem: React.FC<FriendItemProps> = ({ friend }) => (
	<div className="flex items-center gap-2">
		<img
			className="w-8 h-8 bg-gray-600 rounded-full"
			src={fetchUserPfp(friend.id)}
			alt={friend.name}
		/>
		<span className="text-white text-sm">{friend.name}</span>
	</div>
);

// Search Result Item Component
interface SearchResultItemProps {
	user: User;
	isFriend: boolean;
	onAddFriend: (user: User) => void;
	onRemoveFriend: (user: User) => void;
}
const SearchResultItem: React.FC<SearchResultItemProps> = ({
	user,
	isFriend,
	onAddFriend,
	onRemoveFriend,
}) => (
	<div className="p-3 rounded-[5px] cursor-pointer flex items-center justify-between bg-hoverEffect hover:bg-opacity-[10%] hover:bg-secondary">
		<div className="flex items-center space-x-2">
			<img
				src={fetchUserPfp(user.pfp)}
				className="w-10 h-10 rounded-full"
				alt={user.username}
			/>
			<div className="overflow-x-auto no-scrollbar">{user.username}</div>
		</div>
		{isFriend ? (
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
);

// Main Profile Component
const Profile: React.FC = () => {
	const { appState } = useAppProvider();
	const { addTempNotif } = useNotificationProvider();
	const [userData, setUserData] = useState<User>({
		id: "",
		username: "",
		email: "",
		pfp: "",
	});
	const [friends, setFriends] = useState<Friend[]>([]);
	const [inputValue, setInputValue] = useState<string>("");
	const [searchResult, setSearchResult] = useState<User[]>([]);
	const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);

	// Fetch user data
	useEffect(() => {
		const fetchUser = async () => {
			try {
				const data: User = await getUserData(appState.user_id);
				setUserData(data);
			} catch (err) {
				console.error("Failed to fetch user data:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchUser();
	}, [appState.user_id]);

	// Fetch friends
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
					value: `${friend.username} is now your friend.`,
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
					value: `${friend.username} is not a friend anymore.`,
				});
			})
			.catch((err) => console.error("Failed to remove friend:", err));
	};

	return (
		<div className="flex flex-col w-full bg-primary">
			<div className="grid grid-cols-[4fr_1fr] gap-4 w-full">
				<div className="flex flex-col">
					<div className="mb-8">
						<ProfileCard
							usertag={userData.email || "0 Playlist"}
							username={userData.username || "Unknown User"}
							friendcount={friends.length}
							user_uuid={userData.id}
						/>
					</div>
					<div className="h-[658px] overflow-scroll no-scrollbar">
						<MusicListsProvider>
							<RecentlyPlayedMusicContainer />
						</MusicListsProvider>
					</div>
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

						{showSuggestions && (
							<div className="absolute w-full mt-2 max-h-[490px] rounded-[5px] bg-hoverEffect text-black overflow-y-auto no-scrollbar">
								{searchResult.map((user) =>
									user.id !== appState.user_id ? (
										<SearchResultItem
											key={user.id}
											user={user}
											isFriend={friends.some((f) => f.id === user.id)}
											onAddFriend={handleAddFriend}
											onRemoveFriend={handleRemoveFriend}
										/>
									) : null,
								)}
							</div>
						)}
					</div>

					<h3 className="text-white text-lg font-bold mt-6 mb-4">Friends</h3>
					<div className="flex flex-col gap-3">
						{friends.map((friend) => (
							<FriendItem key={friend.id} friend={friend} />
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;
