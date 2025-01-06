import React, {useState} from 'react'
import './Profile.css'
import ProfileCard from '../../components/ProfileCard/ProfileCard';
import { useAppState } from "../../AppState.jsx";
import { SERVER_IP, WS_SERVER_IP, wsSend, OpCode } from "../../const.jsx";

function Profile() {
    return (
        <>
            <ProfileCard />
        </>
    );
}

export default Profile;