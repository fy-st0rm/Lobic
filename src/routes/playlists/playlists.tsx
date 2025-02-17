import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Music, Plus } from "lucide-react";

import { useAppProvider } from "providers/AppProvider";
import {
	fetchUserPlaylists,
	createPlaylist,
	Playlist,
	FetchUserPlaylistsResponse,
	CreatePlaylistData,
	fetchPlaylistCoverImg,
	updatePlaylistCoverImg,
} from "@/api/playlist/playlistApi";
import { useSidebarState } from "@/components/SideBar/SideBar";

import img from "/playlistimages/playlistimage.png";


function Playlists() {
	const { appState } = useAppProvider();
	const currentUserId = appState.user_id;
	const navigate = useNavigate();
	const [playlists, setPlaylists] = useState<Playlist[]>([]);
	const [showPlaylistAdder, setShowPlaylistAdder] = useState<boolean>(false);
	const [playlistName, setPlaylistName] = useState<string>("UnknownPlaylist");
	const [playlistType, setPlaylistType] = useState<boolean>(false); // false for Solo Playlist, true for Combined Playlist
	const [newPlaylistImage, setNewPlaylistImage] = useState<string>("");
	const { isExtended } = useSidebarState();
	const [playlistCovers, setPlaylistCovers] = useState<Record<string, string>>(
		{},
	);

	const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPlaylistName(e.target.value);
	};

	const handleType = (e: React.ChangeEvent<HTMLSelectElement>) => {
		// Convert the string value to a boolean
		setPlaylistType(e.target.value === "true");
	};

	const fetchPlaylists = async () => {
		try {
			const playlistsData: FetchUserPlaylistsResponse =
				await fetchUserPlaylists(currentUserId);
			setPlaylists(playlistsData.playlists);

			// Fetch cover images for all playlists
			const coverUrls: Record<string, string> = {};
			await Promise.all(
				playlistsData.playlists.map(async (playlist) => {
					try {
						const coverUrl = await fetchPlaylistCoverImg(playlist.playlist_id);
						coverUrls[playlist.playlist_id] = coverUrl;
					} catch (error) {
						coverUrls[playlist.playlist_id] = img; // Default image on error
					}
				}),
			);
			setPlaylistCovers(coverUrls);
		} catch (error) {
			console.error("Error fetching playlists:", error);
		}
	};

	useEffect(() => {
		if (currentUserId) {
			fetchPlaylists();
		}
	}, [currentUserId]);

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const tempImageUrl = URL.createObjectURL(file);
			setNewPlaylistImage(tempImageUrl);
		}
	};

	const handleAddPlaylistClick = async () => {
		// Create the playlist data using the updated interface
		const playlistData: CreatePlaylistData = {
			playlist_name: playlistName,
			user_id: currentUserId,
			is_playlist_combined: playlistType, // Pass boolean for combined playlist type
		};

		try {
			const newPlaylist = await createPlaylist(playlistData);

			if (newPlaylistImage && newPlaylist.playlist_id) {
				await updatePlaylistCoverImg(newPlaylist.playlist_id, newPlaylistImage);
			}

			setShowPlaylistAdder(false);
			setNewPlaylistImage("");
			fetchPlaylists();
		} catch (error) {
			console.error("Error creating playlist:", error);
		}
	};

	const handlePlaylistClick = (playlist: Playlist) => {
		navigate(`/playlist/${playlist.playlist_id}`, {
			state: { playlistData: playlist },
		});
	};

	return (
		<>
			<div className="m-5">
				<div className="text-3xl font-bold text-white">Your Playlists</div>
				<div className="mt-3 w-full flex flex-wrap overflow-y-auto">
					{playlists.length > 0 && (
						<>
							{playlists.map((playlist) => (
								<div
									key={playlist.playlist_id}
									onClick={() => handlePlaylistClick(playlist)}
									className="music-container h-[215px] w-44 p-4 m-1 rounded-md transition-all my-2  hover:bg-secondary hover:bg-opacity-80"
								>
									<div className="h-44 w-44">
										{playlistCovers[playlist.playlist_id] ? (
											<div className="h-44 w-44">
												<img
													src={playlistCovers[playlist.playlist_id]}
													alt={playlist.playlist_name}
													className="h-[100%] w-[100%]"
												/>
											</div>
										) : ''}
									</div>
									<div className="music-info flex flex-col gap-0">
										<div className="text-lg font-bold text-primary_fg">
											{playlist.playlist_name}
										</div>
										<div className="text-xs text-primary_fg opacity-70">
											{playlist.is_playlist_combined
												? "Combined PLaylist"
												: "Solo Playlist"}
										</div>
									</div>
								</div>
							))}
						</>
					)}
					<div
						onClick={() => setShowPlaylistAdder(true)}

					>
						<div
							className="
					relative
					flex flex-col items-center justify-center
					bg-primary hover:bg-secondary hover:bg-opacity-50
					rounded-[13px]
					m-0 
					transition-all
					p-5
					h-[215px]
				"
						>
							<div className="
					bg-secondary
					w-32 h-32 rounded-full
					flex items-center justify-center
					mb-5
				">
								<Plus className="w-full h-full text-primary p-5" />
							</div>
							<div className="font-bold text-2xl text-primary_fg">
								Create Playlist
							</div>
						</div>
					</div>
				</div>
			</div>
			{showPlaylistAdder && (
				<div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
					<div className="top-[30%] left-[30%] flex flex-col bg-[#072631] bg-opacity-100 h-[300px] w-[500px] rounded-lg">
						<div className="text-xl font-bold text-white p-5">
							Create a Playlist
						</div>
						<div className="flex">
							<input
								type="file"
								className="hidden"
								accept="image/*"
								onChange={handleImageChange}
							/>
							<div
								onClick={() => {
									const fileInput = document.querySelector(
										"input[type='file']",
									) as HTMLInputElement;
									fileInput.click();
								}}
								className="flex flex-col justify-center items-center h-52 w-52 bg-gray-700 cursor-pointer mx-5 rounded-md -translate-y-10 text-slate-500 hover:text-slate-400 transition-all overflow-hidden"
							>
								{newPlaylistImage ? (
									<img
										src={newPlaylistImage}
										alt="New Playlist"
										className="h-full w-full object-contain"
									/>
								) : (
									<>
										<Music className="h-40 w-40" />
										<div className="addImage font-medium">Add Image</div>
									</>
								)}
							</div>
							<div className="">
								<input
									onChange={handleName}
									placeholder="Add a Name"
									className="playlistName border-none w-[90%] py-2 rounded-sm after:appearance-none px-2 my-2 focus:outline-none focus:border-1 focus:border-black"
								/>
								<div className="flex flex-col justify-between h-[75%]">
									<div className="">
										<select
											onChange={handleType}
											className="block py-1 px-1 w-full text-sm text-white opacity-25 bg-transparent border-0 border-b-[1px] border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-gray-200"
										>
											<option
												value=""
												className="text-white bg-[#1d586d] hover:bg-[#157697]"
												disabled
												selected
											>
												Select Playlist Type
											</option>
											<option
												className="bg-[#1d586d] hover:bg-[#157697]"
												value="false"
											>
												Solo Playlist
											</option>
											<option
												className="bg-[#1d586d] hover:bg-[#157697]"
												value="true"
											>
												Combined Playlist
											</option>
										</select>
									</div>
									<div className="flex">
										<button
											onClick={handleAddPlaylistClick}
											className="hover:bg-[#157697] bg-[#1d586d] border-none text-white font-bold py-2 px-4 rounded-full transition-all ml-20 cursor-pointer"
										>
											Create
										</button>
										<button
											onClick={() => {
												setShowPlaylistAdder(false);
												setNewPlaylistImage("");
											}}
											className="cursor-pointer bg-slate-200 hover:bg-slate-300 border-none text-black font-bold py-2 px-4 rounded-full mx-1"
										>
											Cancel
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

export default Playlists;
