import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { SERVER_IP } from "../../const.jsx";

function Auth({ children }) {
	const [auth, setAuth] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		fetch(SERVER_IP + "/verify", {
			method: "GET",
			credentials: "include",
		}).then((res) => {
			if (res.ok) {
				setAuth(true);
			} else {
				setAuth(false);
				navigate("/");
			}
		});
	}, []);

	return auth ? children : null;
}

export default Auth;
