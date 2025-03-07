// Node modules
import { FC, useState, useEffect, useRef } from "react";

// Local
import { ImageFromUrl } from "api/music/musicApi";

// Assets
import { Plus, AudioLines } from "lucide-react";
import LobbyIcon from "/sidebar/Lobby.svg";

/*
 * React component for lobby card
 */

type LobbyCardProps = {
	lobby_id: string;
	lobby_name: string;
	lobby_icon: string;
	listeners_cnt: number;
	song_name: string;
	artist_name: string;
	onClick: (lobby_id: string) => void;
};

export const LobbyCard: FC<LobbyCardProps> = ({
	lobby_id,
	lobby_name,
	lobby_icon,
	listeners_cnt,
	song_name,
	artist_name,
	onClick,
}) => {
	const [isLobbyNameOF, setLobbyNameOF] = useState<boolean>(false);
	const [isSongNameOF, setSongNameOF] = useState<boolean>(false);
	const [isArtistNameOF, setArtistNameOF] = useState<boolean>(false);

	const cardRef = useRef<HTMLDivElement | null>(null);
	const lobbyNameRef = useRef<HTMLDivElement | null>(null);
	const songCardRef = useRef<HTMLDivElement | null>(null);
	const songNameRef = useRef<HTMLDivElement | null>(null);
	const artistNameRef = useRef<HTMLDivElement | null>(null);

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

			if (artistNameRef.current && songCardRef.current) {
				setArtistNameOF(
					artistNameRef.current.scrollWidth > songCardRef.current.clientWidth,
				);
			}
		};

		checkOverflow();

		window.addEventListener("resize", checkOverflow);
		return () => window.removeEventListener("resize", checkOverflow);
	}, [lobby_name, song_name, artist_name]);

	const MusicInfo = () => {
		return (
			<>
				<div className="absolute w-[80%] top-1 bg-secondary bg-opacity-85 rounded-full">
					<div className="py-2 px-4 flex items-center justify-center">
						{/* Equalizer icon */}
						<AudioLines className="absolute left-3 pr-2 text-primary_fg flex-shrink-0" />

						{/* Song Name and Artist Name section */}
						<div
							ref={songCardRef}
							className="flex flex-col w-[65%] box-border overflow-hidden"
						>
							{/* Song Name */}
							<div
								className={`
									${isSongNameOF ? "" : "flex flex-col items-center justify-center"}
								`}
							>
								<div
									ref={songNameRef}
									className={`
										whitespace-nowrap font-semibold text-primary_fg
										${isSongNameOF ? "group-hover:animate-scroll-on-hover" : ""}
									`}
								>
									{song_name}
									{isSongNameOF && (
										<div
											style={{ paddingLeft: "15%", display: "inline-block" }}
										>
											{" "}
											{song_name}{" "}
										</div>
									)}
								</div>
							</div>

							{/* Artist Name */}
							<div
								className={`
									${isArtistNameOF ? "" : "flex flex-col items-center justify-center"}
								`}
							>
								<div
									ref={artistNameRef}
									className={`
										whitespace-nowrap text-xs text-secondary_fg
										${isArtistNameOF ? "group-hover:animate-scroll-on-hover" : ""}
									`}
								>
									{artist_name}
									{isArtistNameOF && (
										<div
											style={{ paddingLeft: "15%", display: "inline-block" }}
										>
											{" "}
											{artist_name}{" "}
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</>
		);
	};

	return (
		<>
			<div
				onClick={() => onClick(lobby_id)}
				className="
					relative
					flex flex-col items-center justify-center
					bg-primary hover:bg-secondary
					rounded-[13px]
					py-7
					transition-all
					group
				"
			>
				{/* Lobby Icon */}
				<div className="w-32 h-32 rounded-full overflow-hidden">
					<img
						className={`w-full h-full ${lobby_icon ? "" : "p-1"}`}
						src={lobby_icon ? ImageFromUrl(lobby_icon) : LobbyIcon}
						alt="Image"
					/>
				</div>

				{/* Lobby Name */}
				<div
					ref={cardRef}
					className={`
						${isLobbyNameOF ? "" : "flex items-center justify-center"}
						font-semibold text-xl text-primary_fg
						mt-3 w-[90%]
						box-border overflow-hidden
					`}
				>
					<div
						ref={lobbyNameRef}
						className={`whitespace-nowrap ${isLobbyNameOF ? "group-hover:animate-scroll-on-hover" : ""}`}
					>
						{lobby_name}
						{isLobbyNameOF && (
							<div style={{ paddingLeft: "15%", display: "inline-block" }}>
								{" "}
								{lobby_name}{" "}
							</div>
						)}
					</div>
				</div>

				{/* Listener count */}
				<div className="font-semibold text-sm text-secondary_fg">
					{listeners_cnt} Lobblers
				</div>

				{song_name.length > 0 && <MusicInfo />}
			</div>
		</>
	);
};

/*
 * React component for create lobby button
 */

type CreateLobbyButtonProps = {
	onClick: () => void;
};

export const CreateLobbyButton: FC<CreateLobbyButtonProps> = ({ onClick }) => {
	return (
		<>
			<div
				onClick={onClick}
				className="
					relative
					flex flex-col items-center justify-center
					bg-primary hover:bg-secondary hover:bg-opacity-50
					rounded-[13px]
					m-0 
					transition-all
				"
			>
				<div
					className="
					bg-secondary
					w-32 h-32 rounded-full
					flex items-center justify-center
					mb-5
				"
				>
					<Plus className="w-full h-full text-primary p-5" />
				</div>
				<div className="font-bold text-2xl text-primary_fg">Create Lobby</div>
			</div>
		</>
	);
};
