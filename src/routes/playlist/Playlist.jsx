import MusicPlayer from "../../components/MusicPlayer/MusicPlayer";
import NavBar from "../../components/NavBar/NavBar";
import SongContainer from "../../components/SongContainer/SongContainer";

function Playlist() {
    return(
        <>
        <NavBar />
        {/* <div className="playlistinfo ">
            <div className="playlistcover"> </div>
            <div className="playlistinfo">
                <div className="playlistname"></div>
                <div className="typeofplaylist"></div>
                <div className="infobar">
                    <div className="playlistcreators">
                        <div className="creatorimg"></div>
                        <div className="creatorname"></div>
                    </div>
                    <div className="songcount"></div>
                </div>
               
            </div>
            <div className="controlbuttons">
                <div className="playbutton"></div>
                <div className="addtoplaylist"></div>
            </div>
        </div> */}
        <SongContainer />
        <MusicPlayer />
        </>       
    );
}
export default Playlist;