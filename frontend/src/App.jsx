import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/landing/LandingPage";
import Dashboard from "./pages/workspace/Dashboard";
import Workstation from "./pages/workspace/Workstation";
import LoginPage from "./components/login";

function App() {
	return (
		<Routes>
			<Route path="/" element={<LandingPage />} />
			<Route path="/auth" element={<LoginPage />} />
			<Route path="/dashboard" element={<Dashboard />} />
			{/* <Route path="/workspace/:projectId" element={<Workstation />} /> */}

			<Route path="/workspace" element={<Workstation />} />
		</Routes>
	);
}

export default App;
