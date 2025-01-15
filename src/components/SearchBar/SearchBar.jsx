import React from "react";
import { searchMusic } from "../../api/musicSearchApi";
const SearchBar = ({ isDisabled, inputValue, onInputChange, onClearInput }) => {
	const handleKeyPress = async (event) => {
		if (event.key === "Enter") {
			try {
				const data = await searchMusic(inputValue);
				console.log("Search response:", data);
			} catch (error) {
				console.error("Error performing search:", error);
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
