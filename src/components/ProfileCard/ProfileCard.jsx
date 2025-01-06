import React, {useState} from 'react'
import './ProfileCard.css'

function ProfileCard() {
    return (
        <>
            <div className='info-container'>
                <div className='profilepic-container'>
                    <img src = '/public/sadit.jpg' className='profile-pic'> </img>
                </div>
                <div className='user-details-container'> 

                </div>
            </div>
        </>
    );
}

export default ProfileCard;