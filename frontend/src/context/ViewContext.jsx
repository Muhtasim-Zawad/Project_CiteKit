import { createContext, useContext, useState } from "react";

const ViewContext = createContext();

export function ViewProvider({ children }) {
	const [activeView, setActiveView] = useState("projects");

	const handleSetActiveView = (view) => {
		setActiveView(view);
	};

	return (
		<ViewContext.Provider
			value={{ activeView, setActiveView: handleSetActiveView }}
		>
			{children}
		</ViewContext.Provider>
	);
}

export function useView() {
	const context = useContext(ViewContext);
	if (!context) {
		throw new Error("useView must be used within a ViewProvider");
	}
	return context;
}
