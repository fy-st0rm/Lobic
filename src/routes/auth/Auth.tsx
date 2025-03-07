// Node modules
import React, { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Local
import { SERVER_IP } from "@/const";
import { useAppProvider } from "providers/AppProvider";

export const Auth: FC<{ children: React.ReactNode }> = ({
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


export const Verify: FC<{ children: React.ReactNode }> = ({
	children,
}): React.ReactElement => {
	const navigate = useNavigate();
	const { appState } = useAppProvider();

	const [verify, setVerify] = useState<boolean>(false);

	useEffect(() => {
		fetch(`${SERVER_IP}/email/verify/${appState.user_id}`, {
			method: "GET",
			credentials: "include",
		}).then((res) => {
			if (res.ok) {
				setVerify(true);
			} else {
				setVerify(false);
				navigate(`/otp_page/home/${appState.user_id}`);
			}
			return res.text();
		})
	}, []);

	return verify ? <div>{children}</div> : <div></div>;
};


export const OTPVerify: FC<{ children: React.ReactNode }> = ({
	children,
}): React.ReactElement => {
	const navigate = useNavigate();
	const { appState } = useAppProvider();

	const [verify, setVerify] = useState<boolean>(false);

	useEffect(() => {
		fetch(`${SERVER_IP}/otp/verify/${appState.user_id}`, {
			method: "GET",
			credentials: "include",
		}).then((res) => {
			if (res.ok) {
				setVerify(true);
			} else {
				setVerify(false);
				navigate("/login");
			}
			return res.text();
		})
	}, []);

	return verify ? <div>{children}</div> : <div></div>;
};

