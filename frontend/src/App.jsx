import { Button } from "@/components/ui/button";
import LandingPage from "./pages/landing/LandingPage";
import Dashboard from "./pages/workspace/Dashboard";
import Workstation from "./pages/workspace/Workstation";
import Editor from "./components/rich-text-editor/editor";

function App() {
	return (
		<div>
			{/* <LandingPage />  */}
			{/* <Dashboard /> */}
			<Workstation />
		</div>
	);
}

export default App;
