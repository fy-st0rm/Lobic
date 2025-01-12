import React from "react";
import "./Music.css";
import { EllipsisVertical } from "lucide-react";
function Music({ title, artist, coverArt, onClick }) {
  return (
    <>
      <div className="music-container">
        <div className="music-photo-container" onClick={onClick}>
          <img className="music-photo" src={coverArt} />
        </div>
        <div className="info-container">
          <div className="music-info">
            <h2 className="music-title"> {title} </h2>
            <h3 className="artist-name opacity-75"> {artist} </h3>
          </div>
        </div>
        <div className="dropdown absolute right-0 bottom-3">
          <EllipsisVertical className="opacity-40 " />
          <div className="dropdown-items">
            <div className="dropdown-item"> Add to Queue</div>
            <div className="dropdown-item">Add to Playlist</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Music;
