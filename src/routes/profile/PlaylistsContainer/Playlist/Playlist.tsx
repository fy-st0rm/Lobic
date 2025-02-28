import React from "react";

interface PlaylistProps {
  image: string;
  title: string;
}

const Playlist: React.FC<PlaylistProps> = ({ image, title }) => {
  return (
    <div className="relative w-[223px] h-[240px] bg-black/50 flex rounded-[15px] flex-col justify-start items-center overflow-visible text-white transition-all duration-300 ease-in-out mt-5 ml-5 mb-5 hover:scale-110 hover:shadow-[0_0_0_2px_rgba(255,255,255,0.8)] active:scale-95">
      <div className="w-[80%] h-[90%] mt-[10px] overflow-hidden">
        <img className="w-full h-full object-cover rounded-[5px]" src={image} alt={title} />
      </div>
      <h4 className="m-[10px] text-[10pt]">{title}</h4>
    </div>
  );
};

export default Playlist;
