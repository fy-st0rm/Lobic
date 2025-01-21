import React, { useState, ChangeEvent } from "react";
import "./SearchList.css";
import ClearButton from "/public/close.png";
interface SearchListState {
	searchValue: string;
}

const SearchList: React.FC = () => {
	const [searchValue, setSearchValue] = useState<string>("");

	const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
		setSearchValue(event.target.value);
	};

	const handleClearSearch = (): void => {
		setSearchValue("");
	};

	return (
		<div className="search-list-card">
			<div className="search-bar-container">
				<input
					type="text"
					placeholder="Search for People"
					className="profile-searchbar"
					value={searchValue}
					onChange={handleSearchChange}
				/>
				<button className="profile-clear-button" onClick={handleClearSearch}>
					<img
						className="profile-clear-png"
						src={ClearButton}
						alt="Clear search"
					/>
				</button>
			</div>
		</div>
	);
};

export default SearchList;
