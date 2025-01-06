import MusicPlayer from "../../components/MusicPlayer/MusicPlayer";
import NavBar from "../../components/NavBar/NavBar";
import SongContainer from "../../components/SongContainer/SongContainer";
import PlaylistImage from "/playlistimages/playlistimage.png";
import User1 from "/user_images/manish.jpg"
import User2 from "/user_images/sameep.jpg"
import { Dot } from 'lucide-react';
function Playlist() {
    return(
        <>
        <NavBar />
        <SongContainer />
        <MusicPlayer />
        </>       
    );
}
export default Playlist;