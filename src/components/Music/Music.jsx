import React from 'react'
import './Music.css'

function Music(){
    return (
    <>
        <div className="music-container">
            <div className="music-photo-container"> 
                <img className="music-photo" src="./public/music-cover.png" /> 
            </div>
            <div className="music-info">
                <h2 className="music-title"> Bhool </h2>
                <h3 className="artist-name"> Albatross </h3>
            </div>
        </div>
    
    </>
    );
}

export default Music;