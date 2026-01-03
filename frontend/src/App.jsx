import { Routes, Route } from "react-router-dom";

import { Button } from "@/components/ui/button";
import LandingPage from "./pages/landing/LandingPage";
import Dashboard from "./pages/workspace/Dashboard";
import Workstation from "./pages/workspace/Workstation";
import Editor from "./components/rich-text-editor/editor";

function App() {
	return (
		<Routes>
			<Route path="/" element={<LandingPage />} />
			<Route path="/dashboard" element={<Dashboard />} />
			{/* <Route path="/workspace/:projectId" element={<Workstation />} /> */}

			<Route path="/workspace" element={<Workstation />} />
		</Routes>
	);
}

export default App;
