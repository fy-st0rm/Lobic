import React from 'react'

import logo from '/lobic_logo.png'
import './Signup.css'

function signup() {
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
				<form>
					<div>
						<p className='emailPassword'>Email</p>
						<input type='email' className='inputBox' placeholder='Enter your email' required/>
						<br/>
						<p className='emailPassword'>Password</p>
						<input type='password' className='inputBox' placeholder='Enter your password' required/>
						<br />
						<p className='emailPassword'>Confirm Password</p>
						<input type='password' className='inputBox' placeholder='Confirm your password' required/>
						<div>
						<button type="submit" className='signinButton'>Signup</button>
						</div>
					</div>
				</form>
				<div>
					<p className='alreadyRegistered'> Already Registered? <span className='login'>Login</span></p>
				</div>
			</div>
		</div>

	</div>
  )
}

export default signup