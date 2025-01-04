import cover from "/covers/cover.jpg";
function SongInfo() {
    return (

          <div className="flex justify-evenly items-center mt-0 mx-2">
            <div className="flex items-center gap-0 font-bold grow-[0.8] px-4 py-[2px]">
                <div className="cover h-[66px] w-[66px] py-1 self-start"><img src={cover} alt="" className="cover h-[100%] w-[100%] rounded " /></div>
                <div className="self-start mt-5 ml-5">
                    <div className="font-sans text-[100%] text-white text-nowrap overflow-hidden">Pretty Boy</div>
                    <div className="font-sans text-[50%] text-white opacity-65  text-nowrap overflow-hidden">The Neighbourhood</div>
                </div>
            </div>
            <div className="font-sans text-[70%] text-white font-bold duration grow-[1] px-4 py-2">3:08</div>
            <div className="font-sans text-[70%] text-white font-bold addedby grow-[0.5] px-4 py-2 overflow-hidden text-nowrap ">Manish</div>
          </div>
    
    );
  }
  
  export default SongInfo;