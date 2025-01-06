import MusicPlayer from "../../components/MusicPlayer/MusicPlayer";
import NavBar from "../../components/NavBar/NavBar";
import SongContainer from "../../components/SongContainer/SongContainer";
import PlaylistImage from "/playlistimages/playlistimage.png";
import User1 from "/user_images/manish.jpg"
import User2 from "/user_images/sameep.jpg"
import { Dot } from 'lucide-react';
function Playlist() {
    return (
        <>


            
            <div className="absolute flex gap-6 top-[20%] left-[10%] playlistinfo h-[50%] w-[20%]">
                <div className="playlistcover relative self-center  rounded-[10px]"> <img src={PlaylistImage} className=" h-[50%] w-[28.125]" /></div>
                <div className="playlistinfo self-center">
                    <div className="playlistname text-white text-[50px] font-bold">SHEEESH</div>
                    <div className="typeofplaylist text-white text-[15px] relative pl-2 top-[-9px] font-thin">Combined Playlist</div>
                    <div className="infobar flex relative top-[-9px]">
                        <div className="playlistcreators flex gap-2 ">
                            <div className="creatorimg px-1 py-[2px] "><img className=" absolute h-[20px] w-[20px] rounded-full" src={User1} /> <img className=" relative left-2 h-[20px] w-[20px] rounded-full" src={User2} /></div>
                            <div className="creatorname text-white opacity-50 pb-0.5 text-[8px] font-bold self-center">manish and 1 other</div>
                        </div>
                        <div className=" text-white opacity-50 text-[7px] font-bold self-center"><Dot className=" p-0 h-5 w-5" /></div>
                        <div className="songcount text-white opacity-50 text-[8px] font-bold self-center pb-0.5">30 songs</div>
                    </div>
                    <div className="controlbuttons">
                        <div className="playbutton"></div>
                        <div className="addtoplaylist"></div>
                    </div>
                </div>
            </div>
            <SongContainer />
        </>
    );
}
export default Playlist;