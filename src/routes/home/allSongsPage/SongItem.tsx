import { ImageFromUrl, MusicTrack as Song } from "@/api/music/musicApi";
import { Plus, PlusCircle, Heart } from "lucide-react";
import { useState } from "react";

const ActionButton = ({
	onClick,
	icon: Icon,
	label,
}: {
	onClick: () => void;
	icon: typeof Plus | typeof PlusCircle | typeof Heart;
	label: string;
}) => (
	<button
		onClick={onClick}
		className="flex items-center justify-center w-8 h-8 bg-white/10 rounded-full hover:bg-white/20"
		aria-label={label}
	>
		<Icon className="h-5 w-5" />
	</button>
);

interface SongItemProps {
	index: number;
	song: Song;
	onAddToQueue: (song: Song) => void;
	onAddToLikedSongs: (song: Song) => void;
	onAddToPlaylist: (song: Song) => void;
}

const SongItem: React.FC<SongItemProps> = ({
	index,
	song,
	onAddToQueue,
	onAddToLikedSongs,
	onAddToPlaylist,
}) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	return (
		<div className="flex justify-evenly items-center mt-3 p-2 rounded-md hover:bg-primary_fg hover:bg-opacity-10 mx-2">
			<div className="flex w-[85%] items-center">
				<div className="self-center font-medium pr-4 pl-4">{index + 1}</div>
				<div className="items-center h-[50px] w-[50px] flex-shrink-0 self-start">
					<img
						src={ImageFromUrl(song.image_url)}
						alt={song.title}
						className="w-full h-full rounded-sm object-cover cursor-pointer shadow-md 
			  transition-transform duration-200 group-hover:shadow-lg"
					/>
				</div>
				<div className="w-[40%] px-4 min-w-0">
					<h3 className="font-DM_Sans font-bold text-white text-sm overflow-hidden text-ellipsis whitespace-nowrap">
						{song.title}
					</h3>
					<p className="font-DM_Sans font-normal text-sm text-white opacity-40 text-nowrap overflow-hidden text-ellipsis">
						{song.artist}
					</p>
				</div>

				<div className="font-DM_Sans text-sm text-white font-normal w-[40%] px-4 opacity-40 overflow-hidden text-ellipsis whitespace-nowrap">
					{song.album}
				</div>

				<div className="font-DM_Sans text-sm text-white font-normal w-[10%] px-4 opacity-40">
					{song.duration !== undefined
						? `${Math.floor(song.duration / 60)} : ${String(song.duration % 60).padStart(2, "0")}`
						: "0:00"}
				</div>
			</div>

			<div className="w-[15%] flex justify-center space-x-2">
				<ActionButton
					onClick={() => onAddToQueue(song)}
					icon={Plus}
					label="Add to queue"
				/>
				<ActionButton
					onClick={() => onAddToLikedSongs(song)}
					icon={Heart}
					label="Like song"
				/>
				<ActionButton
					onClick={() => setIsDropdownOpen(!isDropdownOpen)}
					icon={PlusCircle}
					label="Add to playlist"
				/>

				{isDropdownOpen && (
					<div
						className="absolute right-0 mt-2 w-56 bg-[#072631] bg-opacity-80 
			rounded-lg shadow-lg z-50 translate-y-full"
					>
						<button
							onClick={() => {
								onAddToPlaylist(song);
								setIsDropdownOpen(false);
							}}
							className="w-full text-left px-3 py-2 text-sm font-bold hover:bg-[#157697] 
				hover:bg-opacity-50 hover:rounded-lg flex items-center"
						>
							<PlusCircle className="h-4 w-4 mr-2" />
							Add to Playlist
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default SongItem;
