import { useState } from 'react';
import { useNavigate } from "react-router-dom";

import logo from '/lobic_logo.png';
import './Signup.css';
import { SERVER_IP } from "../../conf.jsx";

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isError, setIsError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const navigate = useNavigate();

    const handleSignup = async (event) => {
        event.preventDefault();

        // Basic password validation
        if (password !== confirmPassword) {
            setIsError(true);
            setErrorMsg("Passwords do not match");
            return;
        }

        // Payload for signup
        const payload = {
            email: email,
			username : email.split("@")[0],  // [TODO] might need to change later 
            password: password,
        };

		const response = await fetch(SERVER_IP + "/signup", {
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

		navigate("/login");
    };

    const handleLoginRedirect = () => {
        navigate("/login");
    };

    return (
        <div className='container'>
            <div className='logo'>
                <img src={logo} alt="lobic_logo" style={{width:'70px', height:'auto'}}/>
            </div>
            <div className='outercircle'></div>
            <div className='innercircle'></div>

            <div className='signupContainer'>
                <div>
                    <p className='signupText'>Signup to LOBIC</p>
                    <br/>
                    <form onSubmit={handleSignup}>
                        <div>
                            <p className='emailPassword'>Email</p>
                            <input 
                                type='email' 
                                className='inputBox' 
                                placeholder='Enter your email' 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <br/>
                            <p className='emailPassword'>Password</p>
                            <input 
                                type='password' 
                                className='inputBox' 
                                placeholder='Enter your password' 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <br />
                            <p className='emailPassword'>Confirm Password</p>
                            <input 
                                type='password' 
                                className='inputBox' 
                                placeholder='Confirm your password' 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />

                            {isError && (
                                <div className='error-message'>
                                    <p>{errorMsg}</p>
                                </div>
                            )}

                            <div>
                                <button type="submit" className='signinButton'>Signup</button>
                            </div>
                        </div>
                    </form>
                    <div>
                        <p className='alreadyRegistered'> 
                            Already Registered? 
                            <span className='login' onClick={handleLoginRedirect}>Login</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;