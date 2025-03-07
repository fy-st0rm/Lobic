// ForgotPassword.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Assets
import logo from "/navbar/LobicLogo.svg";

function ForgotPassword() {
	const [email, setEmail] = useState<string>("");
	const navigate = useNavigate();

	const handleResetPassword = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		// Implement your password reset logic here
		console.log("Reset link will be sent to: ", email);
	};

	const handleBackToLogin = () => {
		navigate("/login");
	};

	return (
		<div className="relative flex h-screen items-center justify-center">
			{/* Logo Section */}
			<div className="absolute left-0 top-0 p-4">
				<img src={logo} alt="lobic_logo" className="h-auto w-[50px]" />
			</div>
			{/* Background Card */}
			<div className="absolute h-[550px] w-[475px] rounded-xl bg-black/70" />

			{/* Forgot Password Form Container */}
			<div className="flex flex-col absolute w-[400px] rounded-lg p-4 text-center">
				<div>
					<p className="mb-4 font-mono text-2xl font-extrabold text-white">
						Forgot Password?
					</p>
					<p className="mb-8 font-mono text-sm text-white">
						Enter your email address to receive a link to reset your password.
					</p>

					<form onSubmit={handleResetPassword}>
						{/* Email Field */}
						<div>
							<p className="mb-1 ml-8 text-left font-mono text-white font-semibold">
								Email
							</p>
							<input
								type="email"
								placeholder="Enter your email"
								value={email}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setEmail(e.target.value)
								}
								required
								className="mx-auto block w-5/6 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-black/60 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
							/>
						</div>

						{/* Submit Button */}
						<div className="mt-6">
							<button
								type="submit"
								className="mt-5 mb-4 h-10 w-[100px] rounded-full bg-[#3a95b4] border-none font-mono text-sm text-white"
							>
								Submit
							</button>
						</div>
					</form>

					{/* Link to navigate back to Login */}
					<div>
						<p
							className="mt-2 cursor-pointer font-mono text-white font-semibold"
							onClick={handleBackToLogin}
						>
							Back to Login
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ForgotPassword;
