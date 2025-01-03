import React from 'react'
import './Music.css'

function Music({ title, artist, coverArt}){
    return (
    <>
        <div className="music-container">
            <div className="music-photo-container"> 
                <img className="music-photo" src={coverArt} /> 
            </div>
            <div className="music-info">
                <h2 className="music-title"> {title} </h2>
                <h3 className="artist-name"> {artist} </h3>
            </div>
        </div>
    
    </>
    );
}

export default Music;