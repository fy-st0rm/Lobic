import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useState } from "react";		
import{search, SearchResponse} from "@/api/searchApi";
import SearchResults from "./SearchResults";
import { Cat } from "lucide-react";

const ResultsPage: React.FC = () => {
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const query = queryParams.get("query")||''; // Get the query parameter from the URL
	const category = ["All", "Songs", "Playlists", "People"];
	
	
	const [selectedCategory, setSelectedCategory] = useState<string>("All");
	const handlecategoryClick = (category: string) => {
		setSelectedCategory(category);
	};
	return (
		<>
			<div>
				<h1>Search Results for: {query}</h1>
			</div>

		<div className="flex m-5 gap-3">
				{category.map((cat) => (
					<div className={`" px-5 rounded-full py-2 cursor-pointer text-xs text-primary_fg" ${selectedCategory === cat ? "bg-primary_fg text-secondary bg-opacity-100 transition-all" : "bg-secondary text-primary_fg bg-opacity-80 hover:bg-opacity-100 transition-all"}`}
					onClick={()=>handlecategoryClick(cat)}>
						{cat}
					</div>
				))}
			</div> 
			<div>
				<SearchResults category={selectedCategory} query={query} />
			</div>
		</>



	);
};

export default ResultsPage;
