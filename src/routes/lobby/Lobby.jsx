import { useState, useEffect, useRef } from "react";
import test_logo from "/covers/cover.jpg";
import equalizer_logo from "/music_equalizer.png";
import "./Lobby.css"

const LobbyCard = ({
	lobby_name,
	listeners_cnt,
	song_name,
	artist_name,
	lobby_icon,
	card_index
}) => {
	const [isLobbyNameOF, setLobbyNameOF] = useState(false);
	const [isSongNameOF, setSongNameOF] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const [animate, setAnimate] = useState(false);
	const cardRef = useRef(null);
	const lobbyNameRef = useRef(null);
	const songCardRef = useRef(null);
	const songNameRef = useRef(null);

	const handleMouseEnter = () => setIsHovered(true);
	const handleMouseLeave = () => setIsHovered(false);

	useEffect(() => {
		const timer = setTimeout(() => setAnimate(true), 0);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		const checkOverflow = () => {
			if (lobbyNameRef.current && cardRef.current) {
				setLobbyNameOF(lobbyNameRef.current.scrollWidth > cardRef.current.clientWidth);
			}
			if (songNameRef.current && songCardRef.current) {
				setSongNameOF(songNameRef.current.scrollWidth > songCardRef.current.clientWidth);
			}
		};

		checkOverflow();

		window.addEventListener('resize', checkOverflow);
		return () => window.removeEventListener('resize', checkOverflow);
	}, []);

	return (
		<>
			<div>
				<div
					className={`lobby-card-canvas ${animate ? "animate": ""}`}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					style={{ animationDelay: `${card_index * 0.1}s` }}
				>

					{/* Blurry background */}
					<div className="lobby-card-bg">
					</div>

					{ /* Body of the card */ }
					<div className="lobby-card-canvas">

						{ /* Lobby icon */ }
						<div className="lobby-card-icon-canvas">
							<img
								src={lobby_icon}
								className="lobby-card-icon"
							/>
						</div>

						{ /* Lobby name */ }
						<div
							ref={cardRef}
							className="lobby-card-lobby-name"
						>
							<div
								ref={lobbyNameRef}
								style={{
									display: "flex",
									animationName: isLobbyNameOF && isHovered ? "scroll-text" : "none",
									animationDuration: "10s",
									animationTimingFunction: "linear",
									animationIterationCount: "infinite",
									animationPlayState: "running",
								}}
							>
								{lobby_name}
								{isLobbyNameOF && <div style={{paddingLeft: "15%"}}> {lobby_name} </div>}
							</div>
						</div>

						{ /* Listener count */ }
						<div className="lobby-card-listeners-cnt">
							{listeners_cnt} listeners
						</div>
					</div>

					{ /* Body for the song */ }
					<div className="lobby-card-song-canvas">

						{ /* Music equalizer image */ }
						<img
							src={equalizer_logo}
							className="lobby-card-music-logo"
						/>

						{ /* Music info */ }
						<div ref={songCardRef} className="lobby-card-song-info">
							<div
								ref={songNameRef}
								className="lobby-card-song-name"
								style={{
									animationName: isSongNameOF && isHovered ? "scroll-text" : "none",
									animationDuration: "10s",
									animationTimingFunction: "linear",
									animationIterationCount: "infinite",
									animationPlayState: "running",
									justifyContent: isSongNameOF ? "left" : "center"
								}}
							>
								{song_name}
								{isSongNameOF && <div style={{paddingLeft: "15%"}}> {song_name} </div>}
							</div>
							<div className="lobby-card-artist-name">
								{artist_name}
							</div>
						</div>
					</div>

				</div>
			</div>
		</>
	);
}

function Lobby() {
	const [showContent, setShowContent] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			setShowContent(true);
		}, 100); // Delay to ensure content is rendered before animation
	}, []);

	return (
		<>
			<div className={`grid-container ${showContent ? "show" : ""}`}>
				<LobbyCard
					lobby_name="Lobby Name that is long"
					listeners_cnt="3"
					song_name="Some song"
					artist_name="Artist"
					lobby_icon={test_logo}
					card_index="1"
				/>
				<LobbyCard
					lobby_name="Lobby Name that is long"
					listeners_cnt="3"
					song_name="Some song"
					artist_name="Artist"
					lobby_icon={test_logo}
					card_index="2"
				/>
				<LobbyCard
					lobby_name="Lobby Name that is long"
					listeners_cnt="3"
					song_name="Some song"
					artist_name="Artist"
					lobby_icon={test_logo}
					card_index="3"
				/>
				<LobbyCard
					lobby_name="Lobby Name that is long"
					listeners_cnt="3"
					song_name="Some song"
					artist_name="Artist"
					lobby_icon={test_logo}
					card_index="4"
				/>
				<LobbyCard
					lobby_name="Lobby Name"
					listeners_cnt="3"
					song_name="Some song that is very long"
					artist_name="Artist"
					lobby_icon={test_logo}
					card_index="5"
				/>
			</div>
		</>
	);
}

export default Lobby;
