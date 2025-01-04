import MusicPlayer from "../../components/MusicPlayer/MusicPlayer";
import NavBar from "../../components/NavBar/NavBar";
import SongContainer from "../../components/SongContainer/SongContainer";

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