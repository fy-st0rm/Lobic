import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { searchMusic } from "../../api/music/musicSearchApi";

interface SearchBarProps {
	isDisabled: boolean;
	onClearInput: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ isDisabled, onClearInput }) => {
	const [inputValue, setInputValue] = useState<string>("");
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchAndSetSuggestions = async () => {
			if (inputValue.trim()) {
				try {
					const results = await searchMusic(inputValue, 0, 10);
					setSuggestions(results.map((result: any) => result.title));
					setShowSuggestions(true);
				} catch (error) {
					console.error("Error fetching suggestions:", error);
					setSuggestions([]);
					setShowSuggestions(false);
				}
			} else {
				setSuggestions([]);
				setShowSuggestions(false);
			}
		};

		const debounce = setTimeout(fetchAndSetSuggestions, 300);
		return () => clearTimeout(debounce);
	}, [inputValue]);

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	};

	const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && inputValue.trim()) {
			navigate(`/results?query=${encodeURIComponent(inputValue)}`);
			setShowSuggestions(false);
		}
	};

	const handleSuggestionClick = (suggestion: string) => {
		setInputValue(suggestion);
		setShowSuggestions(false);
		navigate(`/results?query=${encodeURIComponent(suggestion)}`);
	};

	const handleFocus = () => {
		if (suggestions.length > 0) {
			setShowSuggestions(true);
		}
	};

	const handleBlur = () => {
		setTimeout(() => {
			setShowSuggestions(false);
		}, 200);
	};

	return (
		<div className="w-1/3 flex items-center relative mx-auto">
			<input
				type="text"
				placeholder="Search..."
				value={inputValue}
				onChange={handleInputChange}
				onKeyDown={handleKeyPress}
				className="w-full px-5 py-2 rounded-full border border-gray-300 focus:border-blue-500 focus:outline-none text-black"
				disabled={isDisabled}
				onFocus={handleFocus}
				onBlur={handleBlur}
			/>
			{inputValue && (
				<button
					className="bg-transparent border-none cursor-pointer absolute right-3"
					onClick={() => {
						setInputValue("");
						setSuggestions([]);
						onClearInput();
					}}
					disabled={isDisabled}
				>
					<img src="./close.png" className="w-3 h-3" alt="Clear Button" />
				</button>
			)}
			{showSuggestions && suggestions.length > 0 && (
				<div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded shadow-md z-10 max-h-52 overflow-y-auto">
					<ul className="list-none m-0 p-0">
						{suggestions.map((suggestion, index) => (
							<li
								key={index}
								className="py-2 px-4 cursor-pointer text-sm text-gray-800 hover:bg-gray-100"
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
