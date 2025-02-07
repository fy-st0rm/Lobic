import "./Sidebar.css";
import { useNavigate, Link } from "react-router-dom";
import React from 'react'

function SideBar() {
    return (
        <div className="h-[80vh] w-[10vw] bg-secondary absolute my-5 mx-2 rounded-sm">
            <div className=" flex flex-col px-3 py-5">
            <Link
                        to="/home" className="no-underline text-primary_fg">

            <div className="flex gap-3 items-center m-2">
                <div>
                   
                    
                        <img
                            className="navbar-home"
                            src="./public/home.png"
                            alt="Home Icon"
                        />
                   
                </div>
                <div>Home</div>
            </div>
            </Link>
            <Link
                        to="/lobby"
                        className="no-underline text-primary_fg"
                    >
            <div className="flex gap-2 items-center m-2">
                <div>
                   
                        <img
                            className="navbar-icons"
                            src="./public/people.png"
                            alt="Friends Icon"
                        />
                   
                </div>
                <div>Lobby</div>
            </div>
            </Link>
            <Link
                        to="/playlists"
                        className="no-underline text-primary_fg"
                    >
            <div className="flex gap-2 items-center m-2">
                <div>
                 
                        <img
                            className="navbar-icons"
                            src="./public/playlist.png"
                            alt="Playlist Icon"
                        />
                
                </div>
                <div>Playlists</div>
            </div>
            </Link>
            </div>
        </div>


    )
}

export default SideBar
