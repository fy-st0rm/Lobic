import { useState } from 'react';
import { useNavigate } from "react-router-dom";

import logo from '/lobic_logo.png';
import './Login.css';
import { SERVER_IP } from "../../conf.jsx";

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const [isError, setIsError] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	const navigate = useNavigate();

	const handleLogin = async (event) => {
		event.preventDefault();

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
			return;
		}

		navigate("/home");
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