import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/landing/LandingPage";
import Dashboard from "./pages/workspace/Dashboard";
import Workstation from "./pages/workspace/Workstation";
import LoginPage from "./components/login";
import SignupPage from "./components/signup";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
	return (
		<Routes>
			<Route path="/" element={<LandingPage />} />

			{/* Auth Routes */}
			<Route path="/auth/login" element={<LoginPage />} />
			<Route path="/auth/signup" element={<SignupPage />} />

			{/* Protected Routes */}
			<Route
				path="/dashboard"
				element={
					<ProtectedRoute>
						<Dashboard />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/workspace"
				element={
					<ProtectedRoute>
						<Workstation />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/workspace/:projectId"
				element={
					<ProtectedRoute>
						<Workstation />
					</ProtectedRoute>
				}
			/>
		</Routes>
	);
}

export default App;
