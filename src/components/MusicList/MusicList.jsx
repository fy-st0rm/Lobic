import React, {useState} from 'react'
import Music from  '../Music/Music'
import './MusicList.css'


function MusicList() {
    const [musicItems, setMusicItems] = useState([
        { id: 1, title: "Bhool", artist: "Albatross", cover: "./public/music-cover.png"},
        { id: 2, title: "About You", artist: "The 1975", cover: "./public/music-cover.png"}

    ]);

    const addMusicItem = () => {
        const newItem = {
            id: musicItems.length + 1,
            title: `New Song ${musicItems.length + 1}`,
            artist: "New Artist",
            cover: "./public/music-cover.png",
        };

        setMusicItems([...musicItems, newItem]);
    };

    const removeMusicItems = (id) => {
        setMusicItems(musicItems.filter((item) => item.id !== id))
    };

    return (
    <>
        <div className="music-list-container">
            <h2 className="list-title"> Featured Music </h2>
            <div className="music-list"> 
                {musicItems.map((item) => (
                    <div key={item.id} className="music-item-wrapper"> 
                        <Music />
                        <button 
                        className="remove-button"
                        onClick={() => removeMusicItems(item.id)}
                        >
                        Remove
                        </button>
                    </div>
                ))}
            </div>
            <button className="add-button" onClick={addMusicItem}>
                Add Music
            </button>
        </div>
    </>
    );
}

export default MusicList;