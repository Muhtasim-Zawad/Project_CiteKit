import { createContext, useContext, useState } from "react";

const ViewContext = createContext();

export function ViewProvider({ children }) {
	const [activeView, setActiveView] = useState("projects");
	const [selectedThreadId, setSelectedThreadId] = useState(null);

	const handleSetActiveView = (view) => {
		setActiveView(view);
	};

	const handleSetSelectedThread = (threadId) => {
		setSelectedThreadId(threadId);
	};

	return (
		<ViewContext.Provider
			value={{
				activeView,
				setActiveView: handleSetActiveView,
				selectedThreadId,
				setSelectedThreadId: handleSetSelectedThread,
			}}
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
