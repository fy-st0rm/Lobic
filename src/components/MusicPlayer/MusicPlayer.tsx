// Node modules
import React, { useState, useEffect } from "react";

// Local
import { ImageFromUrl, MPState, MusicTrack } from "@/api/music/musicApi";
import { useAppProvider } from "providers/AppProvider";
import { useSocketProvider } from "providers/SocketProvider";
import { useMusicProvider } from "providers/MusicProvider";
import { fetchIsSongLiked, toggleSongLiked } from "@/api/music/likedSongsApi";
import { useQueueProvider } from "providers/QueueProvider";
import { updatePlayLog } from "@/api/music/musicApi";
import { useQueueState } from "../Queue/queue";

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
import { Music } from "lucide-react";

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
		<div className="h-[55px] w-[55px] flex-shrink-0">
			<img
				src={imageUrl ? ImageFromUrl(imageUrl) : placeholder}
				alt="Album cover"
				className="rounded-[5px] pt-0 h-full w-full object-cover"
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
	onPrev,
}: {
	isPlaying: boolean;
	isLoading: boolean;
	controlsDisabled: boolean;
	onPlayPause: () => void;
	onNext: () => void;
	onPrev: () =>void;
}) => {
	return (
		<div className="mt-[5px] flex h-full w-full justify-center">
			<button className="control-button" disabled={controlsDisabled} onClick={onPrev}>
				<img
					src={previousButton}
					alt="Previous"
					className={`h-[22px] w-[22px] cursor-pointer opacity-80 hover:opacity-100 transition-all ${controlsDisabled ? "disabled:cursor-not-allowed" : ""}`}
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
					className={`h-9 w-9 cursor-pointer opacity-80 hover:opacity-100 transition-all ${controlsDisabled ? "disabled:cursor-not-allowed" : ""}`}
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
					className={`h-[22px] w-[22px] cursor-pointer opacity-80 hover:opacity-100 transition-all ${controlsDisabled ? "disabled:cursor-not-allowed" : ""}`}
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
		<div className="mb-[10px] h-[80%] w-full flex justify-center items-center">
			<div className="text-[90%] pr-[5px] block ml-auto w-[40px] text-right">
				{formatTime(timestamp)}
			</div>
			<input
				type="range"
				min="0"
				max="100"
				value={(timestamp / duration) * 100 || 0}
				onChange={onSeekMove}
				onMouseUp={onSeekEnd}
				onTouchEnd={onSeekEnd}
				className="self-center block w-1/2 appearance-none h-[2px] bg-white
					[&::-webkit-slider-thumb]:appearance-none 
					[&::-webkit-slider-thumb]:h-[10px] 
					[&::-webkit-slider-thumb]:w-[10px] 
					[&::-webkit-slider-thumb]:bg-white 
					[&::-webkit-slider-thumb]:rounded-full 
					disabled:opacity-50 
					disabled:pointer-events-none 
					disabled:[&::-webkit-slider-thumb]:bg-white 
					disabled:[&::-webkit-slider-thumb]:cursor-not-allowed"
				disabled={isLoading || controlsDisabled}
			/>
			<div className="text-[90%] pl-[5px] block mr-auto w-[40px] text-left">
				{formatTime(duration - timestamp)}
			</div>
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
		<div className="mr-5 self-center flex items-center flex-shrink-0">
			<button
				className="cursor-pointer bg-transparent border-none p-2 pr-[5px]"
				onClick={onVolumeToggle}
				disabled={isLoading}
			>
				<img
					className="h-[25px] w-[25px] pb-1"
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
				className="cursor-pointer opacity-80 w-1/2 self-center mb-[6px] mr-[10px] appearance-none h-[2px]
					[&::-webkit-slider-thumb]:appearance-none 
					[&::-webkit-slider-thumb]:h-[10px] 
					[&::-webkit-slider-thumb]:w-[10px] 
					[&::-webkit-slider-thumb]:bg-white 
					[&::-webkit-slider-thumb]:rounded-full"
				disabled={isLoading}
			/>
		</div>
	);
};

function MusicPlayer() {
	const { appState } = useAppProvider();
	const { getSocket } = useSocketProvider();
	const { audioRef, musicState, controlsDisabled, updateMusicState } = useMusicProvider();
	const { queue, enqueue, dequeue, dequeueReverse, reverseQueue, enqueueReverse, enqueueWhenReversed} = useQueueProvider();
	const { isVisible, toggleQueue } = useQueueState();

	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [timestamp, setTimestamp] = useState<number>(0);
	const [volume, setVolume] = useState<number>(musicState.volume);
	const [initialVolume, setInitialVolume] = useState(musicState.volume);
	const [isLoading, setIsLoading] = useState(false);
	const [isSongLiked, setIsSongLiked] = useState(false);

	const [currentTrack, setCurrentTrack] = useState<MusicTrack>();

	useEffect(() => {
		// Update currentTrack whenever the musicState changes
		if (musicState.id) {
			setCurrentTrack({
				id: musicState.id,
				title: musicState.title || "",
				artist: musicState.artist || "",
				album: musicState.album || "",
				image_url: musicState.image_url || '',
				duration: musicState.duration || 0
			});
		} else {
		}
	}, [musicState.id, musicState.title, musicState.artist, musicState.album, musicState.image_url, musicState.duration]);

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

	// :music controls

	// Properly managing play pause control to avoid blinks of play pause while changing the timestamp
	useEffect(() => {
		if (musicState.state === MPState.PLAY) {
			setIsPlaying(true);
		} else if (musicState.state === MPState.PAUSE) {
			setIsPlaying(false);
		}
	
	}, [musicState.state]);

	// Sync UI timestamp with the music state time
	useEffect(() => {
		setTimestamp(musicState.timestamp);
	}, [musicState.timestamp]);

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
		setVolume(e.target.value);
		updateMusicState({
			state: MPState.CHANGE_VOLUME,
			state_data: e.target.value,
		});
	};

	const volumeToggle = () => {
		if (volume > 0) {
			setInitialVolume(volume);
			setVolume(0);
			updateMusicState({
				state: MPState.CHANGE_VOLUME,
				state_data: 0,
			});
		} else {
			setVolume(initialVolume);
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
		setTimestamp(seekTime);
		updateMusicState({
			state: MPState.CHANGE_TIME,
			state_data: seekTime,
		});
		enqueueReverse(currentTrack!);
	};

	const handleSeekMove = (e: React.ChangeEvent<HTMLInputElement>) => {
		const seekTime = (Number(e.target.value) / 100) * musicState.duration;
		setTimestamp(seekTime);
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
			});
			enqueueReverse(currentTrack!);
			return;
		}
	};

	const previousMusic = () => {
		let nextTrack: MusicTrack | null = dequeueReverse();
		if (nextTrack) {
			updateMusicState({
				id: nextTrack.id,
				title: nextTrack.title,
				artist: nextTrack.artist,
				album: nextTrack.album,
				image_url: nextTrack.image_url,
				state: MPState.CHANGE_MUSIC,
			});
			//enqueueWhenReversed(currentTrack!);
			return;
		}
		
	}
	return (
		<div
			className="music-player w-full bottom-0 left-0 right-0 p-0 px-3  gap-[2px] 
			text-white z-[1000] bg-secondary flex items-center justify-center"
		>
			<div className="h-[55px] w-[55px] ">
				<AlbumCover
					imageUrl={musicState.image_url}
					placeholder={placeholder_logo}
				/>
			</div>

			<div className="flex w-[20%] flex-shrink-0">
				<SongInfo title={musicState.title} artist={musicState.artist} />
				<LikeButton
					isLiked={isSongLiked}
					disabled={isLikeButtonDisabled}
					onClick={handleSongLikedToggle}
				/>
			</div>

			<div className="flex-grow-0 w-[60%] self-center flex-shrink-0">
				<ControlBar
					isPlaying={isPlaying}
					isLoading={isLoading}
					controlsDisabled={controlsDisabled}
					onPlayPause={handlePlayMusic}
					onNext={nextMusic}
					onPrev={previousMusic}
				
					// [] @TODO :add onPrev as well
				/>
				<ProgressBar
					timestamp={timestamp}
					duration={musicState.duration}
					isLoading={isLoading}
					controlsDisabled={controlsDisabled}
					onSeekMove={handleSeekMove}
					onSeekEnd={handleSeekEnd}
				/>
			</div>

			<div
				onClick={toggleQueue}
				className="queue self-center transition-all flex-shrink-0"
			>
				<img src={Queue} className="cursor-pointer h-6 w-6 mx-2 my-[2px]" />
				<div className="flex justify-center items-center m-1">
					<div
						className={`transition-all bg-[#9BB9FF] rounded-full fixed ${isVisible ? "h-1.5 w-1.5" : "h-0 w-0"}`}
					></div>
				</div>
			</div>

			<VolumeControl
				volume={volume}
				isLoading={isLoading}
				onVolumeChange={onVolumeChange}
				onVolumeToggle={volumeToggle}
			/>
		</div>
	);
}
export default MusicPlayer;
