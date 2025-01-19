// Node modules
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleAlert } from 'lucide-react'

// Local
import { performLogin, initClientState } from "api/userApi";
import { useAppProvider } from "providers/AppProvider";

// Assets
import logo from "/lobic_logo.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const { updateAppState } = useAppProvider();

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      await performLogin(email, password);
      const userData = await initClientState();
      updateAppState({ user_id: userData.user_id });
      window.location.href = "/home";
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
    <div className="relative flex h-screen items-center justify-center">
      <div className="absolute left-0 top-0 p-4">
        <img src={logo} alt="lobic_logo" className="h-auto w-[70px]" />
      </div>

      <div className="absolute h-[550px] w-[475px] rounded-xl bg-black/70" />
      

      <div className="flex flex-col absolute w-[400px] rounded-lg p-4 text-center ">
        <div>
          <p className="mb-10 font-mono text-2xl font-extrabold text-white">Login to LOBIC</p>

          <form onSubmit={handleLogin}>
            <div>
              <p className="mb-1 ml-8 text-left font-mono text-white font-semibold">
                Email
              </p>
			  
              <input
                type="email"
                className="mx-auto block w-5/6 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-black/60 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <p className="mb-1 ml-8 text-left font-mono text-white font-semibold">
                Password
              </p>
              <input
                type="password"
                className="mx-auto block w-5/6 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-black/60 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {isError && (
              <div className="mt-2 flex justify-center">
                <CircleAlert className="relative top-1 mx-[1.8px] text-[#E34234]" />
                <p className="my-1 text-[#E34234]">{errorMsg}</p>
              </div>
            )}


            <div className="mt-6">
              <button
                type="submit"
                className="mt-5 mb-4 h-10 w-[100px] rounded-full bg-[#3a95b4] border-none font-mono text-sm text-white"
              >
                Login
              </button>
            </div>
          </form>

          <div>
            <p
              className="mt-2 cursor-pointer font-mono text-white font-semibold"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </p>
          </div>

          <div>
            <p className="mt-2 font-mono text-sm font-semibold text-white">
              Not Registered?{" "}
              <span
                className="cursor-pointer text-white underline"
                onClick={handleSignupRedirect}
              >
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