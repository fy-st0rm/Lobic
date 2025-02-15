import { Routes, Route, Navigate } from "react-router-dom";
import ForgotPassword from "./auth/ForgotPassword";
import Login from "./auth/Login";
import Signup from "./auth/Signup";

function AuthRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Navigate to="/login" replace />} />
			<Route path="/login" element={<Login />} />
			<Route path="/signup" element={<Signup />} />
			<Route path="/forgotpassword" element={<ForgotPassword />} />
		</Routes>
	);
}
export default AuthRoutes;
