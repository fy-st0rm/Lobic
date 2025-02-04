import { Routes, Route, Navigate } from "react-router-dom";
import Login from "routes/login/Login";
import Signup from "routes/signup/Signup";
import ForgotPassword from "routes/login/ForgotPassword";

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
