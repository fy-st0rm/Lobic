import React from 'react'
import './Playlist.css'

function Playlist({image, title}) {
    return (
        <>
            <div className='playlist-card-container'>
                <div className='playlist-photo-container'>
                    <img className="playlist-photo" src={image}/>
                </div>
                <h4> {title} </h4>
            </div>
        </>
    );
}

export default Playlist;