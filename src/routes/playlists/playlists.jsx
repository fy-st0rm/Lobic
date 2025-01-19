// Node modules
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Music, Plus } from "lucide-react";

// Local
import { useAppProvider } from "providers/AppProvider";
import { fetchUserPlaylists, createPlaylist } from "api/playlistApi";

// Assets
import img from "/playlistimages/playlistimage.png";

function Playlists() {
	const { appState } = useAppProvider();
	const currentUserId = appState.user_id;
	const navigate = useNavigate();
	const [playlists, setPlaylists] = useState([]);
	const [showPlaylistAdder, setShowPlaylistAdder] = useState(false);
	const [playlistName, setPlaylistName] = useState("UnknownPlaylist");
	const [playlistType, setPlaylistType] = useState("Solo Playlist");

	const handleName = (e) => {
		setPlaylistName(e.target.value);
	};
	const handleType = (e) => {
		setPlaylistType(e.target.value);
	};

	console.log(playlistType);

	const fetchPlaylists = async () => {
		try {
			const playlistsData = await fetchUserPlaylists(currentUserId);
			setPlaylists(playlistsData);
		} catch (error) {
			console.error("Error fetching playlists:", error);
		}
	};

	useEffect(() => {
		if (currentUserId) {
			fetchPlaylists();
		}
	}, [currentUserId]);

	const handleAddPlaylistClick = async () => {
		const playlistData = {
			playlist_name: playlistName,
			user_id: currentUserId,
			description: playlistType,
		};
		console.log(playlistData.playlist_name);
		setShowPlaylistAdder(false);
		try {
			await createPlaylist(playlistData);
			fetchPlaylists();
		} catch (error) {
			console.error("Error creating playlist:", error);
		}
	};

	const handlePlaylistClick = (playlist) => {
		navigate(`/playlist/${playlist.playlist_id}`, {
			state: { playlistData: playlist },
		});
	};

	return (
		<>
			<div className="absolute top-[80px] w-full  m-6">
				<div className="text-3xl font-bold text-white">Your Playlists</div>
				<div className="mt-3 w-full h-[625px] flex flex-wrap overflow-y-scroll">
					{playlists.length > 0 ? (
						<>
							{playlists.map((playlist) => (
								<div
									key={playlist.playlist_id}
									onClick={() => handlePlaylistClick(playlist)}
									className="bg-gray-800 group transition-all duration-300 ease-in-out h-[240px] w-48 p-4 rounded-lg  cursor-pointer bg-opacity-55 mx-3 relative hover:bg-opacity-75 hover:scale-105 my-2"
								>
									<div className="rounded-[10px]">
										<img src={img} alt="" className="h-[100%] w-[100%]" />
									</div>
									<div className="text-xl font-bold text-white">
										{playlist.playlist_name}
									</div>
									<div className="text-sm text-white opacity-50">
										{playlist.description || "No description"}
									</div>
								</div>
							))}
						</>
					) : (
						<></>
					)}
					<div
						onClick={() => setShowPlaylistAdder(true)}
						className="bg-gray-800 group transition-all duration-300 ease-in-out h-[240px] w-48 p-4 rounded-lg cursor-pointer bg-opacity-55 mx-2 relative hover:bg-opacity-75 my-2 hover:scale-105"
					>
						<div className="rounded-[10px]">
							<Plus className="transition-all duration-300 ease-in-out h-36 w-36 text-white opacity-50 absolute left-[17%] top-[40px] group-hover:opacity-80 group-hover:rotate-90 group-hover:scale-110" />
						</div>
						<div className="absolute bottom-12 left-[50px] text-xl font-bold text-white transition-all duration-300 group-hover:text-opacity-90 group-hover:scale-105">
							Create Playlist
						</div>
					</div>
				</div>
			</div>
			{showPlaylistAdder && (
				<div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50 blur-sm">
					<div className="top-[30%] left-[30%] flex flex-col bg-[#072631] bg-opacity-100 h-[300px] w-[500px]  rounded-lg">
						<div className="text-xl font-bold text-white p-5">
							Create a Playlist
						</div>
						<div className="flex">
							<input type="file" className="hidden" />
							<div
								onClick={() => {
									document.querySelector(".hidden").click();
								}}
								className="flex flex-col justify-center items-center playlistimg h-52 w-52 bg-gray-700 cursor-pointer mx-5 rounded-md -translate-y-10 text-slate-500 hover:text-slate-400 transition-all"
							>
								<Music className="h-40 w-40 " />
								<div className="addImage font-medium ">Add Image</div>
							</div>
							<div className="">
								<input
									onChange={handleName}
									placeholder="Add a Name"
									className=" playlistName border-none w-[90%] py-2 rounded-sm after:appearance-none px-2 my-2 focus:outline-none focus:border-1 focus:border-black "
								></input>
								<div className="flex flex-col justify-between h-[75%]">
									<div className="">
										<select
											onChange={handleType}
											className="block py-1 px-1 w-full text-sm text-white opacity-25 bg-transparent border-0 border-b-[1px] border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-gray-200 "
										>
											<option
												value=""
												className=" text-white bg-[#1d586d] hover:bg-[#157697] after:hover:bg-[#157697"
												disabled
												selected
											>
												Select Playlist Type
											</option>
											<option className="bg-[#1d586d] hover:bg-[#157697] after:hover:bg-[#157697]">
												Solo Playlist
											</option>
											<option className="bg-[#1d586d] hover:bg-[#157697]">
												Combined Playlist
											</option>
										</select>
									</div>
									<div className="flex">
										<div>
											<button
												onClick={handleAddPlaylistClick}
												className="hover:bg-[#157697] bg-[#1d586d] border-none text-white font-bold py-2 px-4 rounded-full transition-all ml-20 cursor-pointer"
											>
												Create
											</button>
										</div>
										<div>
											<button
												onClick={() => setShowPlaylistAdder(false)}
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
				</div>
			)}
		</>
	);
}

export default Playlists;
