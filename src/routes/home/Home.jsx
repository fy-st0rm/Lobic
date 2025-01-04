import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { useAppState } from "../../AppState.jsx";
import { SERVER_IP, WS_SERVER_IP, wsSend, OpCode } from "../../const.jsx";
import MusicPlayer from "../../components/MusicPlayer/MusicPlayer";
import NavBar from "../../components/NavBar/NavBar.jsx"
import MusicList from "../../components/MusicList/MusicList.jsx"
import './Home.css'

function Home() {
	const { appState, ws, updateUserId, addMsgHandler } = useAppState();
	console.log("FROM HOME: ", appState);

	useEffect(() => {
		const init = async () => {
			// Getting the user data
			let response = await fetch(SERVER_IP + "/get_user", {
				method: "GET",
				credentials: "include",
			});

			if (!response.ok) {
				let err = await response.text();
				console.log(err);
				return;
			}

			// Updating the user id in app state
			let data = await response.json();
			let user_id = data.user_id;
			updateUserId(user_id);
		}

		init();
	}, []);

	return (
		<>
		<div className="home-container">
			<NavBar />
			<div className="scrollable-area">
			<MusicList />
			<MusicList />
			<MusicList />
			<MusicList />
			</div>


			<MusicPlayer />
		</div>
			
		</>
	);

}

export default Home;
