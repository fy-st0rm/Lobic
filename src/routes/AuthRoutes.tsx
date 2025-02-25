import { Routes, Route, Navigate } from "react-router-dom";
import { Auth } from "./auth/Auth";
import ForgotPassword from "./auth/ForgotPassword";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import OTP_Page from "./auth/OTP_Page";

function AuthRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Navigate to="/login" replace />} />
			<Route path="/login" element={<Login />} />
			<Route path="/signup" element={<Signup />} />
			<Route path="/forgotpassword" element={<ForgotPassword />} />
			<Route
				path="/otp_page"
				element={
					<Auth>
						<OTP_Page />
					</Auth>
				}
			/>
		</Routes>
	);
}
export default AuthRoutes;
