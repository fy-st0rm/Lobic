import { ImageFromUrl, MusicTrack as Song } from "@/api/music/musicApi";
import SongInfo from "@/components/SongInfo/SongInfo";
import { EllipsisVertical, Heart, Plus } from "lucide-react";
import { useState } from "react";

// SongItem Component
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

	return (
		<div
			className={`flex items-center p-4 transition-colors group ${
				isSelected ? "bg-accent/80" : "bg-background hover:bg-accent/50"
			}`}
		>
			<img
				src={ImageFromUrl(song.image_url)}
				alt={song.title}
				className="w-16 h-16 rounded-lg object-cover cursor-pointer"
				onClick={() => onPlay(song)}
			/>

			<div className="ml-4 flex-1">
				<h3 className="text-lg font-semibold text-white truncate">
					{song.title}
				</h3>
				<p className="text-sm text-white truncate">{song.artist}</p>
			</div>

			<div className="relative">
				<div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
					<button
						onClick={() => onAddToQueue(song)}
						className="hover:bg-accent rounded-full p-2"
					>
						<Plus className="h-5 w-5 text-white opacity-70 hover:opacity-100" />
					</button>
					<button
						onClick={() => onAddToLikedSongs(song)}
						className="hover:bg-accent rounded-full p-2"
					>
						<Heart className="h-5 w-5 text-white opacity-70 hover:opacity-100" />
					</button>
					<button
						onClick={() => setIsDropdownOpen(!isDropdownOpen)}
						className="hover:bg-accent rounded-full p-2"
					>
						<EllipsisVertical className="h-5 w-5 text-white opacity-70 hover:opacity-100" />
					</button>
				</div>

				{isDropdownOpen && (
					<div className="absolute right-0 top-full mt-2 w-48 bg-popover text-popover-foreground rounded-lg shadow-lg z-50">
						<button
							onClick={() => {
								onAddToPlaylist(song);
								setIsDropdownOpen(false);
							}}
							className="w-full text-left px-4 py-2 hover:bg-accent/50 rounded-lg"
						>
							Add to Playlist
						</button>
					</div>
				)}
			</div>
		</div>
	);
};
export default SongItem;
