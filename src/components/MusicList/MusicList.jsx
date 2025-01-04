import React, { useState, useEffect } from 'react';
import Music from '../Music/Music';
import './MusicList.css';

function MusicList() {
    const [musicItems, setMusicItems] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMusicData();
    }, []);

    const fetchMusicData = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8080/all_music');
            if (!response.ok) throw new Error('Failed to fetch music data');
            const data = await response.json();
            setMusicItems(data);
            setIsLoading(false);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const getImageUrl = (songId) => `http://127.0.0.1:8080/image/${songId}.png`;

    const addMusicItem = () => {
        const newItem = {
            id: crypto.randomUUID(),
            title: `New Song ${musicItems.length + 1}`,
            artist: "New Artist",
        };
        setMusicItems([...musicItems, newItem]);
    };

    const removeMusicItems = (id) => {
        setMusicItems(musicItems.filter((item) => item.id !== id));
    };

    if (isLoading) return <div>Loading music...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="music-list-container">
            <h2 className="list-title">Featured Music</h2>
            <div className="music-list">
                {musicItems.map((item) => (
                    <div key={item.id} className="music-item-wrapper">
                        <Music 
                            title={item.title}
                            artist={item.artist}
                            coverArt={getImageUrl(item.id)}
                            album={item.album}
                            genre={item.genre}
                        />
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
    );
}

export default MusicList;