import { useState } from 'react';
import { useNavigate } from "react-router-dom";

import logo from '/lobic_logo.png';
import './Login.css';
import { SERVER_IP } from "../../const.jsx";
import { useAppState } from "../../AppState.jsx";

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const [isError, setIsError] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	const navigate = useNavigate();
	const { updateUserId } = useAppState();

	const performLogin = async () => {
		const payload = {
			email: email,
			password: password,
		};

		let response = await fetch(SERVER_IP + "/login", {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			let msg = await response.text();
			setIsError(true);
			setErrorMsg(msg);
		}
	}

	const initClientState = async () => {
		// Getting the user data
		let response = await fetch(SERVER_IP + "/get_user", {
			method: "GET",
			credentials: "include",
		});

		if (!response.ok) {
			let err = await response.text();
			console.log(err);
			setIsError(true);
			setErrorMsg(err)
			return;
		}

		// Updating the user id in app state
		let data = await response.json();
		let user_id = data.user_id;
		updateUserId(user_id);
	}

	const handleLogin = async (event) => {
		event.preventDefault();

		await performLogin();
		if (isError) {
			return;
		}

		await initClientState();
		if (isError) {
			return;
		}

		// Intentionally performing a refresh to connect to backend
		// ps: idk what im doing
		window.location.href = "/home";
		//navigate("/home");
	};

	const handleSignupRedirect = () => {
		navigate("/signup");
	};

	const handleForgotPassword = () => {
		navigate("/forgotpassword");
	};

	return (
		<div className='container'>
			<div className='logo'>
				<img src={logo} alt="lobic_logo" style={{ width: '70px', height: 'auto' }} />
			</div>

			<div className='outercircle'></div>
			<div className='innercircle'></div>

			<div className='loginContainer'>
				<div>
					<p className='loginText'>Login to LOBIC</p>
					<br />
					<form onSubmit={handleLogin}>
						<div>
							<p className='emailPassword'>Email</p>
							<input
								type='email' className='inputBox' placeholder='Enter your email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
							<br />

							<p className='emailPassword'>Password</p>
							<input
								type='password' className='inputBox' placeholder='Enter your password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>

						{
							isError && (
								<div>
									<p>{errorMsg}</p>
								</div>
							)
						}

						<div>
							<button type="submit" className='loginButton'>Login</button>
						</div>
					</form>

					<div>
						<p 
							className='forgotPassword'
							onClick={handleForgotPassword}
							style={{ cursor: 'pointer' }}
						>
							Forgot Password?
						</p>
					</div>

					<div>
						<p className='notRegistered'>
							Not Registered? <span className='signup' onClick={handleSignupRedirect}>Signup</span>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Login;
