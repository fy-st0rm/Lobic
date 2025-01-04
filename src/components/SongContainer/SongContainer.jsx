function SongContainer() {
  return (
    <div className= "absolute top-[12%] right-[4%] bg-primary-100 opacity-65 rounded-[18px] h-[75%] w-[40%] ">
        <div className="flex justify-evenly mt-2 mx-2">
            <div className="font-sans text-[70%] text-white opacity-50 font-bold grow-[2] px-4 py-2">TITLE</div>
            <div className="font-sans text-[70%] text-white opacity-50 font-bold duration grow px-4 py-2">DURATION</div>
            <div className="font-sans text-[70%] text-white opacity-50 font-bold addedby px-4 py-2 overflow-hidden text-nowrap">ADDED BY</div>
        </div>
        <div className="mx-5 left-1 h-[2px] bg-white opacity-50 rounded-[10px]  "></div>
    </div>
  );
}

export default SongContainer;