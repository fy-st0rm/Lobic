import React from 'react';
import { SERVER_IP } from "../../const.jsx";


const SearchBar = ({ 
  isDisabled, 
  inputValue, 
  onInputChange, 
  onClearInput 
}) => {
  const handleKeyPress = async (event) => {
    if (event.key === 'Enter') {
      try {
        const response = await fetch(
          `${SERVER_IP}/search?&search_string=${encodeURIComponent(inputValue)}`
        );
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        console.log('Search response:', data);
      } catch (error) {
        console.error('Error performing search:', error);
      }
    }
  };

  return (
    <div className="searchbar-container">
      <input
        type="text"
        placeholder="Search for your music"
        className="search-bar"
        disabled={isDisabled}
        style={{ pointerEvents: isDisabled ? "none" : "auto" }}
        value={inputValue}
        onChange={onInputChange}
        onKeyPress={handleKeyPress}
      />
      <button className="clear-button">
        <img
          src="./public/close.png"
          className="clear-png"
          onClick={onClearInput}
          alt="Clear Button"
        />
      </button>
    </div>
  );
};

export default SearchBar;