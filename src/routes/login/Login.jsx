import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { performLogin, initClientState } from "../../api/userApi.ts";
import { useAppState } from "../../AppState.jsx";
import logo from "/lobic_logo.png";
import { CircleAlert } from 'lucide-react'
import "./Login.css";

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const [isError, setIsError] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	const navigate = useNavigate();
	const { updateAppState } = useAppState();

	const handleLogin = async (event) => {
		event.preventDefault();

		try {
			// Perform login
			await performLogin(email, password);

			// Initialize client state
			const userData = await initClientState();
			updateAppState({ user_id: userData.user_id });

			// Redirect to home page
			window.location.href = "/home"; // Intentionally refreshing to connect to backend ,He didnt know what he was doing
		} catch (error) {
			setIsError(true);
			setErrorMsg(error.message);
		}
	};

	const handleSignupRedirect = () => {
		navigate("/signup");
	};

	const handleForgotPassword = () => {
		navigate("/forgotpassword");
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
					<p className="loginText">Login to LOBIC</p>
					<br />
					<form onSubmit={handleLogin}>
						<div>
							<p className="emailPassword">Email</p>
							<input
								type="email"
								className="inputBox"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
							<br />

							<p className="emailPassword">Password</p>
							<input
								type="password"
								className="inputBox passwordbox"
								placeholder="Enter your password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>

						{isError && 
								 (
							<div className="flex justify-center mt-2"> 
								 <CircleAlert className= "relative m-0 top-1 mx-[1.8px] text-[#E34234]"/> <p className="my-1 text-[#E34234]">{errorMsg}</p>
							</div>
						)}

						<div>
							<button type="submit" className="loginButton">
								Login
							</button>
						</div>
					</form>

					<div>
						<p
							className="forgotPassword"
							onClick={handleForgotPassword}
							style={{ cursor: "pointer" }}
						>
							Forgot Password?
						</p>
					</div>

					<div>
						<p className="notRegistered">
							Not Registered?{" "}
							<span className="signup" onClick={handleSignupRedirect}>
								Signup
							</span>
						</p>
					</div>
				</div>
			</div>
		
		</div>
		
	);
}

export default Login;
