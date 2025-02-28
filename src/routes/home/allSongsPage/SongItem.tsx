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
	song: Song;
	isSelected: boolean;
	onPlay: (song: Song) => void;
	onAddToQueue: (song: Song) => void;
	onAddToLikedSongs: (song: Song) => void;
	onAddToPlaylist: (song: Song) => void;
}

const SongItem: React.FC<SongItemProps> = ({
	song,
	isSelected,
	onPlay,
	onAddToQueue,
	onAddToLikedSongs,
	onAddToPlaylist,
}) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const containerClasses = `flex items-center p-3 rounded-lg transition-all duration-200 
    ${isSelected ? "bg-secondary/80" : "hover:bg-secondary/40 w-full"} `;

	return (
		<div className={containerClasses}>
			<div className="w-[5%] flex-shrink-0 relative">
				<img
					src={ImageFromUrl(song.image_url)}
					alt={song.title}
					className="w-full h-full rounded-lg object-cover cursor-pointer shadow-md 
              transition-transform duration-200 group-hover:shadow-lg"
					onClick={() => onPlay(song)}
				/>
			</div>

			<div className="w-[60%] px-4 min-w-0">
				<h3 className="text-[15px] font-semibold text-primary_fg truncate">
					{song.title}
				</h3>
				<p className="text-sm text-primary_fg/75 truncate">
					{song.artist} . {song.album}
				</p>
			</div>

			<div className="w-[25%] flex justify-end space-x-2">
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
