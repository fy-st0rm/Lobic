import React, { KeyboardEvent, ChangeEvent } from "react";
import { searchMusic } from "../../api/musicSearchApi";

interface SearchBarProps {
	isDisabled: boolean;
	inputValue: string;
	onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onClearInput: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
	isDisabled,
	inputValue,
	onInputChange,
	onClearInput,
}) => {
	const handleKeyPress = async (
		event: KeyboardEvent<HTMLInputElement>,
	): Promise<void> => {
		if (event.key === "Enter") {
			try {
				const data = await searchMusic(inputValue, 8);
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
