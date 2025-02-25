import React from "react";
import { useLocation } from "react-router-dom";

const ResultsPage: React.FC = () => {
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const query = queryParams.get("query"); // Get the query parameter from the URL

	return (
		<div>
			<h1>Search Results for: {query}</h1>
		</div>
	);
};

export default ResultsPage;
