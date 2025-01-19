import React from "react";
import { useNavigate } from "react-router-dom";

import logo from "/lobic_logo.png";

function ForgotPassword() {
	const navigate = useNavigate();

	const handleGoBack = () => {
		navigate(-1);
	};

	return (
		<div className="container">
			<div className="logo">
				<img
					src={logo}
					alt="lobic_logo"
					style={{ width: "70px", height: "auto" }}
				/>
			</div>

			<div className="outercircle"></div>
			<div className="innercircle"></div>

			<div className="loginContainer">
				<div>
					<p className="loginText">Forgot Password</p>
					<br />
					<div
						style={{
							textAlign: "center",
							padding: "20px",
							fontSize: "18px",
						}}
					>
						This feature is not implemented yet.
					</div>

					<div style={{ textAlign: "center" }}>
						<button className="loginButton" onClick={handleGoBack}>
							Go Back
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ForgotPassword;
