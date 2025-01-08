import { useEffect, useState } from "react";
import SongInfo from "../SongInfo/SongInfo";
import { SERVER_IP, MPState } from "../../const.jsx";
import { useAppState } from "../../AppState.jsx";
function SongContainer() {
  const { updateMusicData } = useAppState();
  const [musicItems, setMusicItems] = useState([]);
  useEffect(() => {
    fetchMusicData();
  }, []);
  const fetchMusicData = async () => {
    try {
      const response = await fetch(`${SERVER_IP}/get_music`);
      if (!response.ok) throw new Error('Failed to fetch music data');
      const data = await response.json();
      setMusicItems(data);

    } catch (err) {
      setError(err.message);

    }


  };
  const handleMusicClick = async (item) => {
    try {

      const coverArt = `${SERVER_IP}/image/${item.id}.png`;

      // Updating Music State globally
      updateMusicData(
        item.id,
        item.title,
        item.artist,
        coverArt,
        MPState.CHANGE
      );
    } catch (err) {
      console.error('Failed to fetch music URL:', err);

    } finally {
    }
  };
  return (
    <div className="absolute top-[11%] right-[4%] bg-primary-100 opacity-65 rounded-[18px] h-[75%] w-[40%] min-w-[300px] flex flex-col pb-5">
      <div className="sticky top-0 bg-primary-100 rounded-[18px]  z-10">
        <div className="flex justify-evenly mt-2 mx-2">
          <div className="font-sans text-[70%] text-white opacity-50 font-bold w-[40%] px-4 py-2">TITLE</div>
          <div className="font-sans text-[70%] text-white opacity-50 font-bold duration w-[30%] px-4 py-2">ALBUM</div>
          <div className="font-sans text-[70%] text-white opacity-50 font-bold addedby w-[20%]  px-4 py-2 overflow-hidden text-nowrap">ADDED BY</div>
        </div>
        <div className="mx-5 left-1 h-[2px] bg-white opacity-50 rounded-[10px] my-1"></div>
      </div>


      <div className="overflow-y-auto flex-1">
        {musicItems.map((item) => (
          <div>
            <SongInfo
              songName={item.title}
              artistName={item.artist}
              duration={item.album}
              addedBy={item.addedBy}
              coverImg={`${SERVER_IP}/image/${item.id}.png`}
              onClick={() => handleMusicClick(item)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SongContainer;