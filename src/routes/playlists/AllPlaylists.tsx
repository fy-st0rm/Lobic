import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Music, Upload, X, Plus} from 'lucide-react';

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

// PlaylistAdder component
interface PlaylistAdderProps {
	onClose: () => void;
	onCreate: (data: CreatePlaylistData, image: string) => Promise<void>;
	playlistName: string;
	setPlaylistName: (name: string) => void;
	playlistType: boolean;
	setPlaylistType: (type: boolean) => void;
	newPlaylistImage: string;
	setNewPlaylistImage: (image: string) => void;
}

const PlaylistAdder: React.FC<PlaylistAdderProps> = ({
	onClose,
	onCreate,
	playlistName,
	setPlaylistName,
	playlistType,
	setPlaylistType,
	newPlaylistImage,
	setNewPlaylistImage,
}) => {
	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) setNewPlaylistImage(URL.createObjectURL(file));
	};

	return (
		<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-secondary rounded-xl shadow-xl max-w-3xl w-full mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-3 border-b border-slate-700">
          <h2 className="text-lg font-bold text-primary_fg">Create a Playlist</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex gap-4">
            <div className="w-1/4">
              <input
                type="file"
                id="playlist-image-input"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              <div
                onClick={() => document.getElementById("playlist-image-input")?.click()}
                className="group relative w-full aspect-square rounded-lg flex flex-col justify-center items-center bg-primary bg-opacity-30 border-2 border-dashed border-slate-700 hover:border-slate-500 transition-all cursor-pointer overflow-hidden"
              >
                {newPlaylistImage ? (
                  <>
                    <img
                      src={newPlaylistImage}
                      alt="Playlist Cover"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <Music className="h-10 w-10 text-slate-500 mb-1" />
                    <span className="text-slate-500 text-xs font-medium">Add Cover</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="w-3/4 flex flex-col justify-between">
              <div className="space-y-3">
                <div>
                  <label htmlFor="playlist-name" className="text-xs font-medium text-primary_fg opacity-50 mb-1 block">
                    Playlist Name
                  </label>
                  <input
                    id="playlist-name"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    placeholder="Enter Playlist Name"
                    className="w-full bg-slate-700 border-0 rounded-md text-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-vivid transition-all placeholder:text-slate-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="playlist-type" className="text-xs font-medium text-slate-400 mb-1 block">
                    Playlist Type
                  </label>
                  <select
                    id="playlist-type"
                    value={playlistType ? "true" : "false"}
                    onChange={(e) => setPlaylistType(e.target.value === "true")}
                    className="w-full bg-slate-700 border-0 rounded-md text-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-vivid transition-all"
                  >
                    <option value="false">Solo Playlist</option>
                    <option value="true">Combined Playlist</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-md text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onCreate({
                    playlist_name: playlistName,
                    user_id: "",
                    is_playlist_combined: playlistType,
                    image_url: newPlaylistImage,
                  }, newPlaylistImage)}
                  className="px-4 py-1.5 rounded-md text-sm font-medium text-white bg-vivid bg-opacity-50 hover:bg-opacity-60 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
	);
};

// PlaylistCard component
interface PlaylistCardProps {
	playlist: Playlist;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
	const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
	const navigate = useNavigate();

	const handlePlaylistClick = (playlist: Playlist) => {
		navigate(`/playlist/${playlist.playlist_id}`, {
			state: { playlistData: playlist },
		});
	};

	// Fetch the cover image when the component mounts or playlist changes
	useEffect(() => {
		const loadCoverImage = async () => {
			try {
				const coverUrl = await fetchPlaylistCoverImg(playlist.playlist_id);
				setCoverImage(coverUrl);
			} catch (error) {
				console.error(
					`Error fetching cover image for playlist ${playlist.playlist_id}:`,
					error,
				);
				setCoverImage(undefined); // Fallback to undefined if fetch fails
			}
		};

		loadCoverImage();
	}, [playlist.playlist_id]);

	return (
		<div
			onClick={() => handlePlaylistClick(playlist)}
			className="flex flex-col p-3 m-1 rounded-md transition-all hover:bg-secondary hover:bg-opacity-80 overflow-hidden"
		>
			<div className="h-44 w-44 flex-shrink-0">
				<img
					className="rounded-lg shadow-lg h-full w-full object-cover"
					src={coverImage || "/playlistimages/playlistimage.png"}
					alt={playlist.playlist_name}
				/>
			</div>
			<div className="text-sm font-semibold m-0 self-start pt-1 px-1 text-primary_fg truncate">
				{playlist.playlist_name}
			</div>
			<div className="text-sm opacity-75 m-0 px-1 self-start text-primary_fg truncate">
				{playlist.is_playlist_combined ? "Combined Playlist" : "Solo Playlist"}
			</div>
		</div>
	);
};

// CreatePlaylistButton component
interface CreatePlaylistButtonProps {
	onClick: () => void;
}

const CreatePlaylistButton: React.FC<CreatePlaylistButtonProps> = ({
	onClick,
}) => (
	<div onClick={onClick}>
		<div className="relative flex flex-col items-center justify-center bg-primary hover:bg-secondary hover:bg-opacity-80 rounded-[13px] m-0 transition-all p-5 h-64">
			<div className="bg-primary_fg bg-opacity-80 w-32 h-32 rounded-full flex items-center justify-center mb-5">
				<Plus className="w-full h-full text-primary p-5" />
			</div>
			<div className="font-bold text-2xl text-primary_fg">Create Playlist</div>
		</div>
	</div>
);

// Main Playlists component
function AllPlaylists() {
	const { appState } = useAppProvider();
	const currentUserId = appState.user_id;

	// State management
	const [playlists, setPlaylists] = useState<Playlist[]>([]);
	const [showPlaylistAdder, setShowPlaylistAdder] = useState<boolean>(false);
	const [playlistName, setPlaylistName] = useState<string>("");
	const [playlistType, setPlaylistType] = useState<boolean>(false);
	const [newPlaylistImage, setNewPlaylistImage] = useState<string>("");
	const [playlistCovers, setPlaylistCovers] = useState<Record<string, string>>(
		{},
	);

	// Data fetching
	const fetchPlaylists = async () => {
		if (!currentUserId) return;

		try {
			const playlistsData: FetchUserPlaylistsResponse =
				await fetchUserPlaylists(currentUserId);
			setPlaylists(playlistsData.playlists);

			// Fetch cover images for all playlists
			const coverUrls: Record<string, string> = {};
			await Promise.all(
				playlistsData.playlists.map(async (playlist) => {
					const coverUrl = await fetchPlaylistCoverImg(playlist.playlist_id);
					coverUrls[playlist.playlist_id] = coverUrl;
				}),
			);
			setPlaylistCovers(coverUrls);
		} catch (error) {
			console.error("Error fetching playlists:", error);
		}
	};

	// Initial load of playlists
	useEffect(() => {
		if (currentUserId) {
			fetchPlaylists();
		}
	}, [currentUserId]);

	// Event handlers
	const handleCreatePlaylist = async (
		data: CreatePlaylistData,
		imageUrl: string,
	) => {
		try {
			const playlistData = {
				...data,
				user_id: currentUserId,
			};
			const newPlaylist = await createPlaylist(playlistData);

			if (imageUrl && newPlaylist.playlist_id) {
				await updatePlaylistCoverImg(newPlaylist.playlist_id, imageUrl);
			}

			setShowPlaylistAdder(false);
			setNewPlaylistImage("");
			fetchPlaylists();
		} catch (error) {
			console.error("Error creating playlist:", error);
		}
	};

	// Reset modal state
	const closePlaylistAdder = () => {
		setShowPlaylistAdder(false);
		setNewPlaylistImage("");
	};

	return (
		<div className="m-5">
			<div className="text-3xl font-bold text-white">Your Playlists</div>

			<div className="mt-3 w-full flex flex-wrap overflow-y-auto px-2">
				{playlists.length > 0 &&
					playlists.map((playlist) => (
						<PlaylistCard key={playlist.playlist_id} playlist={playlist} />
					))}

				<CreatePlaylistButton onClick={() => setShowPlaylistAdder(true)} />

				{showPlaylistAdder && (
					<PlaylistAdder
						onClose={closePlaylistAdder}
						onCreate={handleCreatePlaylist}
						playlistName={playlistName}
						setPlaylistName={setPlaylistName}
						playlistType={playlistType}
						setPlaylistType={setPlaylistType}
						newPlaylistImage={newPlaylistImage}
						setNewPlaylistImage={setNewPlaylistImage}
					/>
				)}
			</div>
		</div>
	);
}

export default AllPlaylists;
