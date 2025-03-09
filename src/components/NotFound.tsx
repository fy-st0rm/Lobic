import { useNavigate } from "react-router-dom";
import { HomeIcon } from "lucide-react";

const NotFound = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
			<div className="text-center space-y-6 p-8">
				<h1 className="text-9xl font-bold text-gray-900">404</h1>

				<div className="space-y-2">
					<h2 className="text-2xl font-semibold text-gray-800">
						Page Not Found
					</h2>
					<p className="text-gray-600 max-w-md">
						Oops! The page you're looking for doesn't exist or has been moved.
					</p>
				</div>

				<button
					onClick={() => navigate("/")}
					className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
				>
					<HomeIcon className="w-4 h-4 mr-2" />
					Back to Home
				</button>
			</div>
		</div>
	);
};

export default NotFound;
