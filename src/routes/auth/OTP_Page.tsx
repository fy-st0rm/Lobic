// Node modules
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Local
import { SERVER_IP } from "@/const";
import { useAppProvider } from "providers/AppProvider";

const OTP_Page = (): React.ReactElement => {
	const { appState } = useAppProvider();
	const navigate = useNavigate();
	const [otp, setOTP] = useState<string>("");

	const verify_otp = () => {
		console.log(otp);
		fetch(`${SERVER_IP}/otp/verify?user_id=${appState.user_id}&otp=${otp}`, {
			method: "GET",
			credentials: "include",
		}).then((res) => {
			if (res.ok) {
				navigate("/home");
			} else {
				throw res.text();
			}
		}).catch((err) => {
			console.error(err);
		});
	};

	return (
		<>
			<input
				type="number"
				value={otp}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
					setOTP(e.target.value)
				}
			/>
			<button onClick={verify_otp}>Submit</button>
		</>
	);
};

export default OTP_Page;
