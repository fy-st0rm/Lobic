import React from 'react'
import './SearchList.css'
import SearchBar from "../SearchBar/SearchBar";

function SearchList() {
    return (
        <>
            <div className="search-list-card">
                <div className="search-bar-container"> 
                    <input 
                        type="text"
                        placeholder="Search for People"
                    />
                </div>
            </div>
        </>
    );
}

export default SearchList;