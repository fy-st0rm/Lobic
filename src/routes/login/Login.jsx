import React from 'react'
import logo from '/lobic_logo.png' 
import './Login.css'

function Login() {
	return (
		<div className='container'>
		<div className='logo'>
			<img src={logo} alt="lobic_logo" style={{width:'70px', height:'auto'}}/>
		</div>
		<div className='outercircle'></div>
		<div className='innercircle'></div>
		<div className='loginContainer'>
			<div>
				<p className='loginText'>Login to LOBIC</p>
				<br/>
				<div>
					<p className='emailPassword'>Email</p>
					<input type='email' className='inputBox' placeholder='Enter your email' required/>
					<br/>
					<p className='emailPassword'>Password</p>
					<input type='password' className='inputBox' placeholder='Enter your password' required/>
				</div>
				<div>
					<button className='loginButton'>Login</button>
				</div>
				<div>
					<p className='forgotPassword'>Forgot Password?</p>
				</div>
				<div>
				<p className='notRegistered'>Not Registered? <span className='signup'>Signup</span></p>
				</div>
			</div>
		</div>
	</div>
	)
}

export default Login
