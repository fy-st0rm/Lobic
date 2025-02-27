// Node modules
import React, { useRef, useState, useEffect, useCallback, useContext } from "react";

// Local
import { ImageFromUrl, MPState, MusicTrack } from "@/api/music/musicApi";
import { useAppProvider } from "providers/AppProvider";
import { useLobbyProvider } from "providers/LobbyProvider";
import { useSocketProvider } from "providers/SocketProvider";
import { useMusicProvider } from "providers/MusicProvider";
import { fetchIsSongLiked, toggleSongLiked } from "@/api/music/likedSongsApi";
import { useQueueProvider } from "providers/QueueProvider";
import { updatePlayLog } from "@/api/music/musicApi";

// Assets
import previousButton from "/controlbar/PreviousButton.svg";
import playButton from "/controlbar/Pause.svg";
import pauseButton from "/controlbar/Play.svg";
import NextButton from "/controlbar/ButtonNext.svg";
import VolumeLow from "/volumecontrols/Volume Level Low.svg";
import Mute from "/volumecontrols/Volume Level Off.svg";
import VolumeHigh from "/volumecontrols/Volume Level High.svg";
import placeholder_logo from "/covers/cover.jpg";
import likedSong from "/controlbar/favourite.svg";
import likedSongFilled from "/controlbar/favouriteFilled.svg";
import Queue from "/controlbar/queue.svg";

import "./MusicPlayer.css";
import { useQueueState } from "../Queue/queue";
import { DivideCircle } from "lucide-react";

const formatTime = (time: number) => {
	const minutes = Math.floor(time / 60);
	const seconds = Math.floor(time % 60);
	return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

const AlbumCover = ({
	imageUrl,
	placeholder,
}: {
	imageUrl: string | null;
	placeholder: string;
}) => {
	return (
		<div>
			<img
				src={imageUrl ? ImageFromUrl(imageUrl) : placeholder}
				alt="Album cover"
				className="rounded-[5px] pt-0 h-[55px] w-[55px]"
			/>
		</div>
	);
};

const SongInfo = ({
	title,
	artist,
}: {
	title: string | null;
	artist: string | null;
}) => {
	return (
		<div className="self-center mask-none overflow-hidden p-2 flex flex-col">
			<div className="text-[15px] overflow-hidden whitespace-nowrap font-bold p-0">
				{title || "No Song Selected"}
			</div>
			<div className="text-[10px] font-bold opacity-70 overflow-hidden whitespace-nowrap p-0">
				{artist || ""}
			</div>
		</div>
	);
};

const LikeButton = ({
	isLiked,
	disabled,
	onClick,
}: {
	isLiked: boolean;
	disabled: boolean;
	onClick: () => void;
}) => {
	return (
		<div
			className={`mt-1 w-8 h-8 self-center transition-transform duration-200 ${
				disabled
					? "opacity-50 cursor-not-allowed"
					: "cursor-pointer hover:scale-110"
			}`}
			onClick={!disabled ? onClick : undefined}
			role="button"
			aria-pressed={isLiked}
			aria-disabled={disabled}
			tabIndex={disabled ? -1 : 0}
			onKeyDown={(e) => {
				if ((e.key === "Enter" || e.key === " ") && !disabled) {
					e.preventDefault();
					onClick();
				}
			}}
		>
			<img
				src={isLiked ? likedSongFilled : likedSong}
				alt={isLiked ? "Liked" : "Not Liked"}
				className="w-6 h-6"
			/>
		</div>
	);
};

const ControlBar = ({
	isPlaying,
	isLoading,
	controlsDisabled,
	onPlayPause,
	onNext,
}: {
	isPlaying: boolean;
	isLoading: boolean;
	controlsDisabled: boolean;
	onPlayPause: () => void;
	onNext: () => void;
}) => {
	return (
		<div className="control-bar">
			<button
				className="control-button"
				disabled={isLoading || controlsDisabled}
			>
				<img
					src={previousButton}
					alt="Previous"
					className={`button-group opacity-80 hover:opacity-100 transition-all${controlsDisabled ? "disabled" : ""}`}
				/>
			</button>
			<button
				className="control-button"
				onClick={onPlayPause}
				disabled={isLoading || controlsDisabled}
			>
				<img
					src={isPlaying ? pauseButton : playButton}
					alt={isPlaying ? "Pause" : "Play"}
					className={`button-group opacity-80 hover:opacity-100 transition-all ${controlsDisabled ? "disabled" : ""} h-9 w-9`}
				/>
			</button>
			<button
				className="control-button"
				disabled={isLoading || controlsDisabled}
				onClick={onNext}
			>
				<img
					src={NextButton}
					alt="Next"
					className={`button-group opacity-80 hover:opacity-100 transition-all ${controlsDisabled ? "disabled" : ""}`}
				/>
			</button>
		</div>
	);
};
const ProgressBar = ({
	timestamp,
	duration,
	isLoading,
	controlsDisabled,
	onSeekMove,
	onSeekEnd,
}: {
	timestamp: number;
	duration: number;
	isLoading: boolean;
	controlsDisabled: boolean;
	onSeekMove: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSeekEnd: (
		e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>,
	) => void;
}) => {
	return (
		<div className="status">
			<div className="music-status">{formatTime(timestamp)}</div>
			<input
				type="range"
				min="0"
				max="100"
				value={(timestamp / duration) * 100 || 0}
				onChange={onSeekMove}
				onMouseUp={onSeekEnd}
				onTouchEnd={onSeekEnd}
				className="status-bar"
				disabled={isLoading || controlsDisabled}
			/>
		</div>
	);
};


const VolumeControl = ({
	volume,
	isLoading,
	onVolumeChange,
	onVolumeToggle,
}: {
	volume: number;
	isLoading: boolean;
	onVolumeChange: (e: { target: { value: any } }) => void;
	onVolumeToggle: () => void;
}) => {
	return (
		<div className="volume-status">
			<button
				className="volume-button"
				onClick={onVolumeToggle}
				disabled={isLoading}
			>
				<img
					className="volume-image"
					src={volume == 0 ? Mute : volume > 40 ? VolumeHigh : VolumeLow}
					alt="Volume"
				/>
			</button>
			<input
				type="range"
				min="0"
				max="100"
				value={volume}
				onChange={onVolumeChange}
				className="volume-control-bar"
				disabled={isLoading}
			/>
		</div>
	);
};

function MusicPlayer() {
	const { appState } = useAppProvider();
	const { lobbyState, updateLobbyState } = useLobbyProvider();
	const { getSocket } = useSocketProvider();
	const { musicState, controlsDisabled, updateMusicState } = useMusicProvider();
	const {isVisible,toggleQueue} = useQueueState();
	const [initialVolume, setInitialVolume] = useState(musicState.volume);
	const [isLoading, setIsLoading] = useState(false);
	const [isSongLiked, setIsSongLiked] = useState(false);
	const [showQueue, setShowQueue] = useState(false);
	const { queue, enqueue, dequeue } = useQueueProvider();


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
		if (musicState.image_url) {
			setIsLoading(false);
		}
	}, [musicState.image_url]);

	const fetchLikedState = async () => {
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

	const handleSongLikedToggle = async () => {
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
			setIsSongLiked(!newLikedState);
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

	const isLikeButtonDisabled = isLoading || !appState.user_id || !musicState.id;

	const nextMusic = () => {
		let nextTrack: MusicTrack | null = dequeue();
		if (nextTrack) {
			updateMusicState({
				id: nextTrack.id,
				title: nextTrack.title,
				artist: nextTrack.artist,
				album: nextTrack.album,
				image_url: nextTrack.image_url,
				state: MPState.CHANGE_MUSIC,
				state_data: 0,
				timestamp: 0,
			});
			return;
		}
	};

	return (
		<div className="music-player bg-secondary flex items-center justify-center">
			<AlbumCover
				imageUrl={musicState.image_url}
				placeholder={placeholder_logo}
			/>

			<div className="flex w-[20%]">
				<SongInfo title={musicState.title} artist={musicState.artist} />
				<LikeButton
					isLiked={isSongLiked}
					disabled={isLikeButtonDisabled}
					onClick={handleSongLikedToggle}
				/>
			</div>

			<div className="flex-grow-0 w-[60%] self-center">
				<ControlBar
					isPlaying={musicState.state === MPState.PLAY}
					isLoading={isLoading}
					controlsDisabled={controlsDisabled}
					onPlayPause={handlePlayMusic}
					onNext={nextMusic}
					// [] @TODO :add onPrev as well
				/>
				<ProgressBar
					timestamp={musicState.timestamp}
					duration={musicState.duration}
					isLoading={isLoading}
					controlsDisabled={controlsDisabled}
					onSeekMove={handleSeekMove}
					onSeekEnd={handleSeekEnd}
				/>
			</div>

			<div onClick={toggleQueue} className="queue self-center transition-all" >
			<img
				src={Queue}
				className="cursor-pointer h-6 w-6 mx-2 my-[2px]"
			/>
			{isVisible && (<div className="h-1.5 w-1.5 bg-[#9BB9FF] rounded-full fixed right-[246px]"></div>)
			
			}
			
		</div>

			<VolumeControl
				volume={musicState.volume}
				isLoading={isLoading}
				onVolumeChange={onVolumeChange}
				onVolumeToggle={volumeToggle}
			/>
		</div>
	);
}
export default MusicPlayer;
