import React, {useState} from 'react'
import './Profile.css'
import ProfileCard from '../../components/ProfileCard/ProfileCard';
import SearchList from '../../components/SearchList/SearchList.jsx'
function Profile() {
    return (
        <>
        <div className='profile-page-container'>\
            <div className='profile-info'>
                <ProfileCard usertag={`@bijan`} username={`Bijan Thapa`} friendcount={`0 friends`}/>
            </div>
            <div className="search-list-container">
                <SearchList />
            </div>
        </div>
        </>
    );
}

export default Profile;