import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { initClientState, performLogin, signupUser } from "@/api/user/userApi";
import logo from "/navbar/LobicLogo.svg";
import { CircleAlert, Eye, EyeOff } from "lucide-react";
import { useAppProvider } from "@/providers/AppProvider";

function Signup() {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [showPassword, setShowPassword] = useState(false);
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [isError, setIsError] = useState<boolean>(false);
	const [errorMsg, setErrorMsg] = useState<string>("");

	const navigate = useNavigate();
	const { updateAppState } = useAppProvider();

	const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			await signupUser(email, password, confirmPassword);
			await performLogin(email, password);
			const userData = await initClientState();
			updateAppState({ user_id: userData.user_id });
			window.location.href = "/home";
			// navigate("/");
		} catch (error) {
			setIsError(true);
			setErrorMsg((error as Error).message); // Cast error to Error type
		}
	};

	const handleLoginRedirect = () => {
		navigate("/login");
	};
	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	return (
		<div className="relative flex h-screen items-center justify-center">
			<div className="absolute left-0 top-0 p-4">
				<img src={logo} alt="lobic_logo" className="h-auto w-[50px]" />
			</div>

			<div className="absolute h-[550px] w-[475px] rounded-xl bg-black/70" />

			<div className="absolute w-[400px] rounded-lg p-4 text-center">
				<div>
					<p className="mb-10 font-mono text-2xl text-white font-extrabold">
						Signup to LOBIC
					</p>

					<form onSubmit={handleSignup}>
						<div>
							<p className="mb-1 ml-8 text-left font-mono text-sm text-white font-semibold">
								Email
							</p>
							<input
								type="email"
								className="mx-auto block w-5/6 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-black/60 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
								placeholder="Enter your email"
								value={email}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setEmail(e.target.value)
								}
								required
							/>

							<p className="mb-1 ml-8 text-left font-mono text-sm text-white font-semibold">
								Password
							</p>
							<div className="">
							<input
								type={showPassword ? "text" : "password"}
								className="mx-auto block w-5/6 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-black/60 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
								placeholder="Enter your password"
								value={password}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setPassword(e.target.value)
								}
								required
							/>
							<button
									type="button"
									onClick={togglePasswordVisibility}
									className="absolute top-[183px] right-14 text-gray-500 hover:text-gray-700 focus:outline-none"
									aria-label={showPassword ? "Hide password" : "Show password"}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>

							<p className="mb-1 ml-8 text-left font-mono text-sm text-white font-semibold">
								Confirm Password
							</p>
							<input
								type={showPassword ? "text" : "password"}
								className="mx-auto block w-5/6 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-black/60 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
								placeholder="Confirm your password"
								value={confirmPassword}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setConfirmPassword(e.target.value)
								}
								required
							/>

							{isError && (
								<div className="mt-2 flex justify-center">
									<CircleAlert className="relative top-1 mx-[1.8px] text-[#E34234]" />
									<p className="my-1 text-[#E34234]">{errorMsg}</p>
								</div>
							)}

							<div className="mt-8">
								<button
									type="submit"
									className="mt-5 mb-4 h-10 w-[100px] border-none rounded-full bg-[#3a95b4] font-mono text-white"
								>
									Signup
								</button>
							</div>
						</div>
					</form>

					<div>
						<p className="mt-2 font-mono text-sm font-semibold text-white">
							Already Registered?{" "}
							<span
								className="cursor-pointer text-white underline"
								onClick={handleLoginRedirect}
							>
								Login
							</span>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Signup;
