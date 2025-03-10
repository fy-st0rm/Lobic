// Node modules
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Local
import { SERVER_IP } from "@/const";
import { useAppProvider } from "providers/AppProvider";

// Assets
import logo from "/navbar/LobicLogo.svg";


const ChangePassword = (): React.ReactElement => {
	const navigate = useNavigate();
	const { appState } = useAppProvider();

	const [msg, setMsg] = useState<string>("");
	const [color, setColor] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmPass, setConfirmPass] = useState<string>("");

	const handlePasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (password.length < 8) {
			setMsg("Password must be at least 8 characters long");
			setColor("text-red-500");
			return;
		}

		if (password !== confirmPass) {
			setMsg("New password didnt matched with confirm password");
			setColor("text-red-500");
			return;
		}

		const payload = {
			user_id: appState.user_id,
			password: password,
		};

		let response = await fetch(`${SERVER_IP}/change_password`, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})

		if (!response.ok) {
			let msg = await response.text();
			setMsg(msg);
			setColor("text-red-500");
			return;
		}

		setMsg("Sucessfully changed the password. Redirecting to login page");
		setColor("text-green-500");

		// Redirecting to login page
		setTimeout(() => {
			navigate("/login");
		}, 3000);
	}

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
					<p className="mb-10 font-mono text-2xl font-extrabold text-white">
						Create your new Password
					</p>

					<form onSubmit={handlePasswordChange}>
						<div>
							<p className="mt-2 mb-1 ml-8 text-left font-mono text-white font-semibold">
								New Password
							</p>
							<input
								type="password"
								placeholder="New Password"
								value={password}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setPassword(e.target.value)
								}
								required
								className="mx-auto block w-5/6 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-black/60 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
							/>
							<p className="mt-2 mb-1 ml-8 text-left font-mono text-white font-semibold">
								New Confirm Password
							</p>
							<input
								type="password"
								placeholder="New Confirm Password"
								value={confirmPass}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setConfirmPass(e.target.value)
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
							onClick={() => navigate("/login")}
						>
							Back to Login
						</p>
					</div>

					{/* Messages */}
					{msg &&
						<div className={`text-sl ${color}`}>
							{msg}
						</div>
					}
			  </div>
			</div>
		</div>
	);
}

export default ChangePassword;
