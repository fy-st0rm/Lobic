import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { searchMusic } from "../../api/music/musicSearchApi"; // Replace with your actual API
import "./SearchBar.css";

interface SearchBarProps {
	isDisabled: boolean;
	onClearInput: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ isDisabled, onClearInput }) => {
	const [inputValue, setInputValue] = useState<string>(""); // State for input value
	const [suggestions, setSuggestions] = useState<string[]>([]); // State for suggestions
	const [showSuggestions, setShowSuggestions] = useState<boolean>(false); // State to control popup visibility

	useEffect(() => {
		const fetchAndSetSuggestions = async () => {
			if (inputValue.trim()) {
				try {
					const results = await searchMusic(inputValue, 0, 10); // Fetch suggestions from API
					setSuggestions(results.map((result: any) => result.title)); // Adjust mapping based on API response
					setShowSuggestions(true); // Show popup if suggestions exist
				} catch (error) {
					console.error("Error fetching suggestions:", error);
					setSuggestions([]);
					setShowSuggestions(false); // Hide popup on error
				}
			} else {
				setSuggestions([]);
				setShowSuggestions(false); // Hide popup if input is empty
			}
		};

		const debounce = setTimeout(fetchAndSetSuggestions, 300); // Debounce to reduce API calls
		return () => clearTimeout(debounce);
	}, [inputValue]);

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value); // Update input value
	};

	const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && inputValue.trim()) {
			console.log("Search submitted:", inputValue); // Trigger search action
			setShowSuggestions(false); // Hide popup
		}
	};

	const handleSuggestionClick = (suggestion: string) => {
		setInputValue(suggestion); // Update input value with selected suggestion
		setShowSuggestions(false); // Hide popup
		console.log("Search submitted:", suggestion); // Trigger search with selected suggestion
	};

	return (
		<div className="searchbar-container">
			<input
				type="text"
				placeholder="Search..."
				value={inputValue}
				onChange={handleInputChange}
				onKeyPress={handleKeyPress}
				className="search-bar"
				disabled={isDisabled}
				onFocus={() => setShowSuggestions(suggestions.length > 0)}
				onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay hiding for clicks
			/>
			<button
				className="clear-button"
				onClick={() => {
					setInputValue("");
					setSuggestions([]);
					onClearInput();
				}}
				disabled={isDisabled}
			>
				<img
					src="./public/close.png"
					className="clear-png"
					alt="Clear Button"
				/>
			</button>
			{showSuggestions && suggestions.length > 0 && (
				<div className="suggestions-popup">
					<ul>
						{suggestions.map((suggestion, index) => (
							<li
								key={index}
								className="suggestion-item"
								onClick={() => handleSuggestionClick(suggestion)}
							>
								{suggestion}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

export default SearchBar;
