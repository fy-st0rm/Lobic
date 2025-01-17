// Node modules
import { FC, useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";

// Assets
import equalizer_logo from "/music_equalizer.png";
import PlusIcon from "/plus.svg";
import test_logo from "/covers/cover.jpg";
import "./LobbyCard.css";

/*
 * React component for lobby card
 */

type LobbyCardProps = {
	lobby_id: string;
	lobby_name: string;
	listeners_cnt: number;
	song_name: string;
	artist_name: string;
	lobby_icon: string;
	card_index: number;
	onClick: (lobby_id: string) => void;
};

export const LobbyCard: FC<LobbyCardProps> = ({
	lobby_id,
	lobby_name,
	listeners_cnt,
	song_name,
	artist_name,
	lobby_icon,
	card_index,
	onClick,
}) => {
	const [isLobbyNameOF, setLobbyNameOF] = useState<boolean>(false);
	const [isSongNameOF, setSongNameOF] = useState<boolean>(false);
	const [isHovered, setIsHovered] = useState<boolean>(false);
	const [animate, setAnimate] = useState<boolean>(false);

	const cardRef = useRef<HTMLDivElement | null>(null);
	const lobbyNameRef = useRef<HTMLDivElement | null>(null);
	const songCardRef = useRef<HTMLDivElement | null>(null);
	const songNameRef = useRef<HTMLDivElement | null>(null);

	const handleMouseEnter = () => setIsHovered(true);
	const handleMouseLeave = () => setIsHovered(false);

	useEffect(() => {
		const timer = setTimeout(() => setAnimate(true), 0);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		const checkOverflow = () => {
			if (lobbyNameRef.current && cardRef.current) {
				setLobbyNameOF(
					lobbyNameRef.current.scrollWidth > cardRef.current.clientWidth,
				);
			}
			if (songNameRef.current && songCardRef.current) {
				setSongNameOF(
					songNameRef.current.scrollWidth > songCardRef.current.clientWidth,
				);
			}
		};

		checkOverflow();

		window.addEventListener("resize", checkOverflow);
		return () => window.removeEventListener("resize", checkOverflow);
	}, []);

	const create_music_info = () => {
		return (
			<>
				{/* Body for the music info */}
				<div className="lobby-card-song-canvas">
					{/* Music equalizer image */}
					<img src={equalizer_logo} className="lobby-card-music-logo" />

					{/* Music info */}
					<div ref={songCardRef} className="lobby-card-song-info">
						<div
							ref={songNameRef}
							className="lobby-card-song-name"
							style={{
								animationName:
									isSongNameOF && isHovered ? "scroll-text" : "none",
								animationDuration: "10s",
								animationTimingFunction: "linear",
								animationIterationCount: "infinite",
								animationPlayState: "running",
								justifyContent: isSongNameOF ? "left" : "center",
							}}
						>
							{song_name}
							{isSongNameOF && (
								<div style={{ paddingLeft: "15%" }}> {song_name} </div>
							)}
						</div>
						<div className="lobby-card-artist-name">{artist_name}</div>
					</div>
				</div>
			</>
		);
	};

	return (
		<>
			<div
				className={`lobby-card-canvas ${animate ? "animate" : ""}`}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				style={{ animationDelay: `${card_index * 0.1}s` }}
				onClick={() => onClick(lobby_id)}
			>
				{/* Blurry background */}
				<div className="lobby-card-bg"></div>

				{/* Body of the card */}
				<div className="lobby-card-canvas">

					{/* Lobby icon */}
					<div className="lobby-card-icon-canvas">
						<img
							src={lobby_icon}
							className="lobby-card-icon"
							onError={(e) => {
								(e.target as HTMLImageElement).src = test_logo;
							}}
						/>
					</div>

					{/* Lobby name */}
					<div ref={cardRef} className="lobby-card-lobby-name">
						<div
							ref={lobbyNameRef}
							style={{
								display: "flex",
								animationName:
									isLobbyNameOF && isHovered ? "scroll-text" : "none",
								animationDuration: "10s",
								animationTimingFunction: "linear",
								animationIterationCount: "infinite",
								animationPlayState: "running",
							}}
						>
							{lobby_name}
							{isLobbyNameOF && (
								<div style={{ paddingLeft: "15%" }}> {lobby_name} </div>
							)}
						</div>
					</div>

					{/* Listener count */}
					<div className="lobby-card-listeners-cnt">
						{listeners_cnt} listeners
					</div>
				</div>

				{ /* Music info */ }
				{song_name.length > 0 && create_music_info()}
			</div>
		</>
	);
};


/*
 * React component for create lobby button
 */

type CreateLobbyButtonProps = {
	card_index: number;
	onClick: () => void;
};

export const CreateLobbyButton: FC<CreateLobbyButtonProps> = ({
	card_index,
	onClick
}) => {
	const [isHovered, setIsHovered] = useState<boolean>(false);
	const [animate, setAnimate] = useState<boolean>(false);

	const handleMouseEnter = () => setIsHovered(true);
	const handleMouseLeave = () => setIsHovered(false);

	useEffect(() => {
		const timer = setTimeout(() => setAnimate(true), 0);
		return () => clearTimeout(timer);
	}, []);

	return (
		<>
			<div
				className={`lobby-card-canvas ${animate ? "animate" : ""}`}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				style={{ animationDelay: `${card_index * 0.1}s` }}
				onClick={onClick}
			>
				<div className="lobby-card-bg"></div>
				<div className="lobby-card-icon-canvas">
					<img src={PlusIcon} className="lobby-card-icon" />
				</div>
				<div className="lobby-card-lobby-name">CREATE LOBBY</div>
			</div>
		</>
	);
};
