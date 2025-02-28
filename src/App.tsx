import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import AppRoutes from "./routes/AppRoutes";
import AuthRoutes from "./routes/AuthRoutes";

function App(): React.ReactElement {
	const location = useLocation();
	const authRoutes = ["/login", "/signup", "/forgotpassword", "/otp_page", "/"];
	const isAuthPage = authRoutes.includes(location.pathname);

	return (
		<>
			<Helmet>
				<title> Lobic </title>
				<link rel="icon" href="/navbar/LobicLogo.svg" />
			</Helmet>

			{isAuthPage ? <AuthRoutes /> : <AppRoutes />}
		</>
	);
}

export default App;
