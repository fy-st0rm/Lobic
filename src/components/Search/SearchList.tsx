import React, { useState, ChangeEvent } from "react";
import ClearButton from "/close.png";

const SearchList: React.FC = () => {
	const [searchValue, setSearchValue] = useState<string>("");

	const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
		setSearchValue(event.target.value);
	};

	const handleClearSearch = (): void => {
		setSearchValue("");
	};

	return (
		<div className="bg-gradient-to-t from-blue-600 to-gray-200 h-screen max-h-96 w-full max-w-lg rounded-2xl flex justify-center items-start pt-5">
			<div className="w-full relative flex justify-center">
				<input
					type="text"
					placeholder="Search for People"
					className="rounded-full border-none w-4/5 py-2 pl-4 pr-10 relative"
					value={searchValue}
					onChange={handleSearchChange}
				/>
				<button
					className="bg-transparent border-none cursor-pointer absolute top-1/2 transform -translate-y-1/2 right-12"
					onClick={handleClearSearch}
				>
					<img
						className="w-3 h-3 cursor-pointer bg-transparent"
						src={ClearButton}
						alt="Clear search"
					/>
				</button>
			</div>
		</div>
	);
};

export default SearchList;
