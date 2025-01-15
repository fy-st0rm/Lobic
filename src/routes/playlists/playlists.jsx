import React, { useEffect, useState } from "react";
import { useAppState } from "../../AppState.jsx";
import { SERVER_IP } from "../../const.jsx";
import { useNavigate } from "react-router-dom";
import img from "/playlistimages/playlistimage.png"
import { Plus } from 'lucide-react';

function Playlists() {
	const { appState } = useAppState();
	const currentUserId = appState.user_id;
	const navigate = useNavigate();

	const [playlists, setPlaylists] = useState([]);

	const fetchPlaylists = async () => {
		try {
			const response = await fetch(
				`${SERVER_IP}/playlist/get_users_playlists?user_uuid=${encodeURIComponent(currentUserId)}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			const result = await response.json();

			if (response.status !== 200) {
				throw new Error(result.message || "Failed to fetch playlists");
			}
			console.log("Playlists fetched successfully:", result.playlists);
			setPlaylists(result.playlists);
		} catch (error) {
			console.error("Error fetching playlists:", error);
		}
	};

	useEffect(() => {
		if (currentUserId) {
			fetchPlaylists();
		}
	}, [currentUserId]);

	//create a new playlist
	const handleAddPlaylistClick = async () => {
		const playlistData = {
			playlist_name: "my playlisst 3",
			user_id: currentUserId,
			description: "asf",
		};

		try {
			const response = await fetch(`${SERVER_IP}/playlist/new`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(playlistData),
			});

			const result = await response.json();

			if (response.status !== 201) {
				throw new Error(result.message || "Failed to create playlist");
			}

			console.log("Playlist created successfully:", result.message);
			fetchPlaylists();
		} catch (error) {
			console.error("Error creating playlist:", error);
		}
	};

	//gop to a particular playlist
	const handlePlaylistClick = (playlist) => {
		navigate(`/playlist/${playlist.playlist_id}`, {
			state: { playlistData: playlist },
		});
	};

	return (
		<div className="absolute top-[80px] w-full h-full m-6">
			<div className="text-3xl font-bold  text-white">Your Playlists</div>
			<div className="mt-8 w-full max-w-4xl flex">
				{playlists.length > 0 ? (
					<>
						{playlists.map((playlist) => (
							<div
								key={playlist.playlist_id}
								onClick={() => handlePlaylistClick(playlist)}
								className="bg-gray-800 group transition-all duration-300 ease-in-out h-[240px] w-48 p-4 rounded-lg cursor-pointer bg-opacity-55 mx-2 self-center relative hover:bg-opacity-75 hover:scale-105"
							>
								<div className=" rounded-[10px]"><img src={img} alt="" className="h-[100%] w-[100%]" /></div>
								<div className="text-xl font-bold text-white">
									{playlist.playlist_name}
								</div>
								<div className="text-sm  text-white opacity-50">
									{playlist.description || "No description"}
								</div>

							</div>
						))}
					</>

				) : (
					<p className="text-gray-300 text-center">No playlists found.</p>
				)}
				<div
					onClick={handleAddPlaylistClick}
					className="bg-gray-800 group transition-all duration-300 ease-in-out h-[240px] w-48 p-4 rounded-lg cursor-pointer bg-opacity-55 mx-2 self-center relative hover:bg-opacity-75 hover:scale-105"
				>
					<div className="rounded-[10px]">
						<Plus
							className="transition-all duration-300 ease-in-out h-36 w-36 text-white opacity-50 absolute left-[17%] top-[40px] group-hover:opacity-80 group-hover:rotate-90 group-hover:scale-110"
						/>
					</div>
					<div className="absolute bottom-12 left-[50px] text-xl font-bold text-white transition-all duration-300 group-hover:text-opacity-90 group-hover:scale-105">
						Create Playlist
					</div>
				</div>


			</div>

		</div>
	);
}

export default Playlists;
