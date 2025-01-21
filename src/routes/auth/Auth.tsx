// Node modules
import React, { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Local
import { SERVER_IP } from "@/const.ts";

const Auth: FC<{ children: React.ReactNode }> = ({
	children,
}): React.ReactElement => {
	const [auth, setAuth] = useState<boolean>(false);
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
				navigate("/login");
			}
		});
	}, []);

	return auth ? <div>{children}</div> : <div></div>;
};

export default Auth;
