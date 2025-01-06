import SongInfo from "../SongInfo/SongInfo";
import cover from "/covers/cover.jpg";
function SongContainer() {
  return (
    <div className="absolute top-[11%] right-[4%] bg-primary-100 opacity-65 rounded-[18px] h-[75%] w-[40%] min-w-[300px] flex flex-col pb-5">
      <div className="sticky top-0 bg-primary-100 rounded-[18px]  z-10">
        <div className="flex justify-evenly mt-2 mx-2">
          <div className="font-sans text-[70%] text-white opacity-50 font-bold grow-[1.99] px-4 py-2">TITLE</div>
          <div className="font-sans text-[70%] text-white opacity-50 font-bold duration grow px-4 py-2">DURATION</div>
          <div className="font-sans text-[70%] text-white opacity-50 font-bold addedby grow-[0.5] px-4 py-2 overflow-hidden text-nowrap">ADDED BY</div>
        </div>
        <div className="mx-5 left-1 h-[2px] bg-white opacity-50 rounded-[10px] my-1"></div>
      </div>
      
      
      <div className="overflow-y-auto flex-1">
        <SongInfo coverImg= {cover} songName = "Pretty Boy"  artistName = "The Neighbourhood" duration = "3:08" addedBy = "Manish"/>
        <SongInfo songName = "Cry Baby"  artistName = "The Neighbourhood" duration = "3:08" addedBy = "Manish"/>
        <SongInfo />
        <SongInfo />
        <SongInfo />
        <SongInfo />
        <SongInfo />
        <SongInfo />
        <SongInfo />
        <SongInfo />
        <SongInfo />
        <SongInfo />
        <SongInfo />
      </div>
    </div>
  );
}

export default SongContainer;