import React from "react";
import { Heart, MoreHorizontal, Play } from "lucide-react";

interface PlaylistProps {
  playlistId: string;
  title: string;
  artist: string;
  imageUrl: string;
  onClick: () => void;
}

const Playlist: React.FC<PlaylistProps> = ({
  playlistId,
  title,
  artist,
  imageUrl,
  onClick,
}) => {
  return (
    <div 
      className="group relative flex flex-col p-3 m-1 rounded-md transition-all hover:bg-secondary hover:bg-opacity-80 overflow-hidden"
    >
      <div className="relative h-45 w-45 flex-shrink-0" onClick={onClick}>
        <img
          className="rounded-lg shadow-lg h-44 w-44 object-cover"
          src={imageUrl}
          alt={`${title} cover`}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="absolute right-2 top-2 flex space-x-2">
          </div>
        </div>
      </div>
      <div className="flex-col justify-start items-start w-44">
        <div
          className="text-sm font-semibold m-0 justify-self-start pt-1 px-1 text-primary_fg truncate"
        >
          {title}
        </div>
        <div className="text-sm opacity-75 m-0 px-1 justify-self-start text-gray-300 truncate">
          {artist}
        </div>
      </div>
    </div>
  );
};

export default Playlist;