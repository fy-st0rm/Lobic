// Node modules
import React, { useRef, useState, useEffect, useCallback } from "react";

// Local
import { MPState, MusicTrack } from "@/api/music/musicApi";
import { useAppProvider } from "providers/AppProvider";
import { useLobbyProvider } from "providers/LobbyProvider";
import { useSocketProvider } from "providers/SocketProvider";
import { useMusicProvider } from "providers/MusicProvider";
import { fetchIsSongLiked, toggleSongLiked } from "@/api/music/likedSongsApi";
import { useQueueProvider } from "providers/QueueProvider";
import { updatePlayLog } from "@/api/music/musicApi";

// Assets
import previousButton from "/controlbar/PreviousButton.svg";
import playButton from "/controlbar/ButtonPlay.svg";
import pauseButton from "/controlbar/ButtonPause.svg";
import NextButton from "/controlbar/ButtonNext.svg";
import VolumeLow from "/volumecontrols/Volume Level Low.png";
import Mute from "/volumecontrols/Volume Mute.png";
import VolumeHigh from "/volumecontrols/Volume Level High.png";
import placeholder_logo from "/covers/cover.jpg";
import likedSong from "/controlbar/love-svgrepo-com.svg";
import likedSongFilled from "/controlbar/love-svgrepo-com-filled.svg";
import { Menu } from "lucide-react";

import "./MusicPlayer.css";

function MusicPlayer() {
	const { appState } = useAppProvider();
	const { lobbyState, updateLobbyState } = useLobbyProvider();
	const { getSocket } = useSocketProvider();
	const { musicState, controlsDisabled, updateMusicState } = useMusicProvider();

	const [initialVolume, setInitialVolume] = useState(musicState.volume);
	const [isLoading, setIsLoading] = useState(false);
	const [isSongLiked, setIsSongLiked] = useState(false);
	const [showQueue, setShowQueue] = useState(false);
	const { queue, enqueue, dequeue } = useQueueProvider();

	const queueToggle = () => {
		showQueue ? setShowQueue(false) : setShowQueue(true);
	};
	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
	};

	useEffect(() => {
		if (appState.user_id && musicState.id) {
			(async () => {
				try {
					await fetchLikedState();
					await updatePlayLog(appState.user_id!, musicState.id!);
				} catch (error) {
					console.error("Error in play logging sequence:", error);
				}
			})();
		}
	}, [appState.user_id, musicState.id]);

	useEffect(() => {
		if (musicState.cover_img) {
			setIsLoading(false);
		}
	}, [musicState.cover_img]);

	// Fetch the liked state of the song when the component mounts or when the song changes
	const fetchLikedState = async () => {
		// Reset like state if no user or no music
		if (!appState.user_id || !musicState.id) {
			setIsSongLiked(false);
			return;
		}
		try {
			const isLiked = await fetchIsSongLiked(appState.user_id, musicState.id);
			setIsSongLiked(isLiked);
		} catch (err) {
			console.error("Failed to fetch song liked state:", err);
			setIsSongLiked(false);
		}
	};

	// Handle toggling the liked state of the song
	const handleSongLikedToggle = async () => {
		// Prevent toggling if no user is logged in or no song is selected
		if (!appState.user_id || !musicState.id) {
			console.log(
				"Cannot toggle like state: No user logged in or no song selected",
			);
			return;
		}
		const newLikedState = !isSongLiked;
		setIsSongLiked(newLikedState);
		try {
			toggleSongLiked(appState.user_id, musicState.id);
		} catch (err) {
			console.error("Failed to update song liked state:", err);
			setIsSongLiked(!newLikedState); // Revert the local state on error
		}
	};

	const handlePlayMusic = async () => {
		try {
			if (!musicState.id) {
				throw new Error("No song selected");
			}

			if (musicState.state == MPState.PLAY) {
				updateMusicState({ state: MPState.PAUSE });
			} else if (musicState.state == MPState.PAUSE) {
				updateMusicState({ state: MPState.PLAY });
				setIsLoading(true);
			}
		} catch (err) {
			console.error("Failed to load/play music:", err);
			updateMusicState({ state: MPState.PAUSE });
		} finally {
			setIsLoading(false);
		}
	};

	const onVolumeChange = (e: { target: { value: any } }) => {
		updateMusicState({
			state: MPState.CHANGE_VOLUME,
			state_data: e.target.value,
		});
	};

	const volumeToggle = () => {
		if (musicState.volume > 0) {
			setInitialVolume(musicState.volume);
			updateMusicState({
				state: MPState.CHANGE_VOLUME,
				state_data: 0,
			});
		} else {
			updateMusicState({
				state: MPState.CHANGE_VOLUME,
				state_data: initialVolume,
			});
		}
	};

	const handleSeekEnd = (
		e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>,
	) => {
		// Get the value from the input element
		const input = e.target as HTMLInputElement;
		const seekTime = (Number(input.value) / 100) * musicState.duration;
		updateMusicState({
			state: MPState.CHANGE_TIME,
			state_data: seekTime,
		});
	};

	const handleSeekMove = (e: React.ChangeEvent<HTMLInputElement>) => {
		const seekTime = (Number(e.target.value) / 100) * musicState.duration;
		updateMusicState({
			state: MPState.CHANGE_TIME,
			state_data: seekTime,
		});
	};

	// Determine if the like button should be disabled
	const isLikeButtonDisabled = isLoading || !appState.user_id || !musicState.id;

	const nextMusic = () => {
		let nextTrack: MusicTrack | null = dequeue();
		if (nextTrack) {
			updateMusicState({
				id: nextTrack.id,
				title: nextTrack.title,
				artist: nextTrack.artist,
				cover_img: nextTrack.cover_img,
				state: MPState.CHANGE_MUSIC,
				state_data: 0,
				timestamp: 0,
			});
			return;
		}
	};

	return (
		<div className="music-player">
			<div>
				<img
					src={musicState.cover_img ? musicState.cover_img : placeholder_logo}
					alt="Album cover"
					className="cover-image"
				/>
			</div>
			<div className="flex w-[20%]">
				<div className="self-center">
					<div className="song-info overflow-hidden p-2">
						<div className="song-name">
							{musicState.id ? musicState.title : "No Song Selected"}
						</div>
						<div className="artist-name">
							{musicState.id ? musicState.artist : ""}
						</div>
					</div>
				</div>
				<div
					className={`mt-1 w-8 h-8 self-center transition-transform duration-200 ${
						isLikeButtonDisabled
							? "opacity-50 cursor-not-allowed"
							: "cursor-pointer hover:scale-110"
					}`}
					onClick={!isLikeButtonDisabled ? handleSongLikedToggle : undefined}
					role="button"
					aria-pressed={isSongLiked}
					aria-disabled={isLikeButtonDisabled}
					tabIndex={isLikeButtonDisabled ? -1 : 0}
					onKeyDown={(e) => {
						if ((e.key === "Enter" || e.key === " ") && !isLikeButtonDisabled) {
							e.preventDefault();
							handleSongLikedToggle();
						}
					}}
				>
					<img
						src={isSongLiked ? likedSongFilled : likedSong}
						alt={isSongLiked ? "Liked" : "Not Liked"}
						className="w-6 h-6"
					/>
				</div>
			</div>

			<div className="control-container">
				<div className="control-bar">
					<button
						className="control-button"
						disabled={isLoading || controlsDisabled}
					>
						<img
							src={previousButton}
							alt="Previous"
							className={`button-group ${controlsDisabled ? "disabled" : ""}`}
						/>
					</button>
					<button
						className="control-button"
						onClick={handlePlayMusic}
						disabled={isLoading || controlsDisabled}
					>
						<img
							src={musicState.state === MPState.PLAY ? pauseButton : playButton}
							alt={musicState.state === MPState.PLAY ? "Pause" : "Play"}
							className={`button-group ${controlsDisabled ? "disabled" : ""}`}
						/>
					</button>
					<button
						className="control-button"
						disabled={isLoading || controlsDisabled}
						onClick={nextMusic}
					>
						<img
							src={NextButton}
							alt="Next"
							className={`button-group ${controlsDisabled ? "disabled" : ""}`}
						/>
					</button>
				</div>
				<div className="status">
					<div className="music-status">{formatTime(musicState.timestamp)}</div>
					<input
						type="range"
						min="0"
						max="100"
						value={(musicState.timestamp / musicState.duration) * 100 || 0}
						onChange={handleSeekMove}
						onMouseUp={handleSeekEnd}
						onTouchEnd={handleSeekEnd}
						className="status-bar"
						disabled={isLoading || controlsDisabled}
					/>
				</div>
			</div>

			{/* Queue */}
			<div className="queue self-center transition-all">
				<Menu onClick={queueToggle} className="cursor-pointer" />
				{showQueue && (
					<div className="fixed rounded-md bg-[#072631] bg-opacity-90 h-[400px] w-[400px] bottom-[90px] right-[5%] overflow-scroll no-scrollbar">
						<div className=" m-2 mt-4 mx-4 font-sans text-[100%] text-white text-xl font-semibold">
							Current Song
						</div>
						<div className="">
							<div className="flex items-center font-bold px-4 pb-2">
								<div className="h-[66px] w-[66px] py-1 self-start rounded-sm">
									<img
										src={
											musicState.cover_img
												? musicState.cover_img
												: placeholder_logo
										}
										alt="Album cover"
										className="h-[100%] w-[100%] rounded-sm"
									/>
								</div>
								<div className="mx-2">
									<div className="font-sans text-[100%] text-white overflow-hidden">
										{musicState.id ? musicState.title : "No Song Selected"}
									</div>
									<div className="font-sans text-[70%] text-white opacity-65 text-nowrap overflow-hidden">
										{musicState.id ? musicState.artist : ""}
									</div>
								</div>
							</div>
							<div className=" mx-4 mb-2 font-sans text-[100%] text-white text-xl font-semibold">
								Queue
							</div>
						</div>
						{queue.map((item) => (
							<div className="flex items-center font-bold px-4 pb-3">
								<div className="h-[66px] w-[66px] py-1 self-start rounded-sm">
									<img
										src={item.cover_img}
										alt="Album cover"
										className="h-[100%] w-[100%] rounded-sm"
									/>
								</div>
								<div className="mx-2">
									<div className="font-sans text-[100%] text-white overflow-hidden">
										{item.title}
									</div>
									<div className="font-sans text-[70%] text-white opacity-65 text-nowrap overflow-hidden">
										{item.artist}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			<div className="volume-status">
				<button
					className="volume-button"
					onClick={volumeToggle}
					disabled={isLoading}
				>
					<img
						className="volume-image"
						src={
							musicState.volume == 0
								? Mute
								: musicState.volume > 40
									? VolumeHigh
									: VolumeLow
						}
						alt="Volume"
					/>
				</button>
				<input
					type="range"
					min="0"
					max="100"
					value={musicState.volume}
					onChange={onVolumeChange}
					className="volume-control-bar"
					disabled={isLoading}
				/>
			</div>
		</div>
	);
}

export default MusicPlayer;
function updateUserPlayLog(arg0: string, arg1: string) {
	throw new Error("Function not implemented.");
}
