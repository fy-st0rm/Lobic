import React, {useState} from 'react'
import Image from '/public/pic_test.png'
import './ProfileCard.css'

function ProfileCard({ usertag, username, friendcount }) {
    return (
        <>
            <div className='info-container'>
                <div className='profile-pic-container'>
                    <img src ={Image} className='user-pic' /> 
                </div>
                <div className='user-details-container'> 
                    <h4> {usertag} </h4>
                    <h2> {username} </h2>
                    <h3> {friendcount} </h3>
                </div>
            </div>
        </>
    );
}

export default ProfileCard;