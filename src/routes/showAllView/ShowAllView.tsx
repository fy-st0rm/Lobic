import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ShowAllView = () => {
	const location = useLocation();
	const listTitle = location.state?.list_title || "Unknown List";

	useEffect(() => {
		// Alert the list title
		alert(`List Title: ${listTitle}`);
	}, [listTitle]);

	return (
		<div style={{ backgroundColor: "red" }}>
			Showing all songs for: {listTitle}
		</div>
	);
};
