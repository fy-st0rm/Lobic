import React from "react";
import "./SearchList.css";
import ClearButton from "/public/close.png";

function SearchList() {
  return (
    <>
      <div className="search-list-card">
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search for People"
            className="profile-searchbar"
          />
          <button className="profile-clear-button">
            {" "}
            <img className="profile-clear-png" src={ClearButton} />{" "}
          </button>
        </div>
      </div>
    </>
  );
}

export default SearchList;
