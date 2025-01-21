// Node modules
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";

// Local
import App from "@/App";
import AudioElement from "components/AudioElement/AudioElement";
import { Providers } from "providers/Providers";

// Assets
import "./index.css";

// Main
const root = document.getElementById("root");

if (!root) {
	throw new Error("Root element with ID 'root' not found");
}

createRoot(root).render(
	<StrictMode>
		<Providers>
			<AudioElement />
			<Router>
				<App />
			</Router>
		</Providers>
	</StrictMode>,
);
