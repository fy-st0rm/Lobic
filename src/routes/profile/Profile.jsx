import React from 'react';
import './Profile.css';
import ProfileCard from '../../components/ProfileCard/ProfileCard';
import SearchList from '../../components/SearchList/SearchList.jsx';
import PlaylistsContainer from '../../components/PlaylistsContainer/PlaylistsContainer.jsx';

function Profile() {
    return (
        <>
        <div className="home-container">
            <div className="profile-page-container">
                <div className="main-content">
                    <div className="profile-info">
                        <ProfileCard usertag={`@bijan`} username={`Bijan Thapa`} friendcount={`0 friends`} />
                    </div>
                    <div className="playlists-container">
                        <PlaylistsContainer />
                    </div>
                </div>
                <div className="search-list-container">
                    <SearchList />
                </div>
            </div>
        </div>
        </>
    );
}

export default Profile;
