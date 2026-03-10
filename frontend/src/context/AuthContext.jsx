import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "@/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Check if user is already logged in on mount
	useEffect(() => {
		const accessToken = localStorage.getItem("access_token");
		const userData = localStorage.getItem("user");

		if (accessToken && userData) {
			try {
				setUser(JSON.parse(userData));
			} catch {
				localStorage.removeItem("access_token");
				localStorage.removeItem("refresh_token");
				localStorage.removeItem("user");
			}
		}
		setLoading(false);
	}, []);

	const signup = async (email, password, name) => {
		try {
			setError(null);
			const response = await authAPI.signup(email, password, name);
			const { access_token, refresh_token, user: userData } = response.data;

			localStorage.setItem("access_token", access_token);
			localStorage.setItem("refresh_token", refresh_token);
			localStorage.setItem("user", JSON.stringify(userData));

			setUser(userData);
			return response.data;
		} catch (err) {
			const message = err.response?.data?.detail || "Signup failed";
			setError(message);
			throw err;
		}
	};

	const login = async (email, password) => {
		try {
			setError(null);
			const response = await authAPI.login(email, password);
			const { access_token, refresh_token, user: userData } = response.data;

			localStorage.setItem("access_token", access_token);
			localStorage.setItem("refresh_token", refresh_token);
			localStorage.setItem("user", JSON.stringify(userData));

			setUser(userData);
			return response.data;
		} catch (err) {
			const message = err.response?.data?.detail || "Login failed";
			setError(message);
			throw err;
		}
	};

	const logout = async () => {
		try {
			await authAPI.logout();
		} catch {
			// Continue with logout even if API call fails
		} finally {
			localStorage.removeItem("access_token");
			localStorage.removeItem("refresh_token");
			localStorage.removeItem("user");
			setUser(null);
			setError(null);
		}
	};

	const resetPassword = async (email) => {
		try {
			setError(null);
			await authAPI.resetPassword(email);
		} catch (err) {
			const message =
				err.response?.data?.detail || "Failed to send reset email";
			setError(message);
			throw err;
		}
	};

	const resendConfirmation = async (email) => {
		try {
			setError(null);
			await authAPI.resendConfirmation(email);
		} catch (err) {
			const message =
				err.response?.data?.detail || "Failed to send confirmation email";
			setError(message);
			throw err;
		}
	};

	const value = {
		user,
		loading,
		error,
		signup,
		login,
		logout,
		resetPassword,
		resendConfirmation,
		isAuthenticated: !!user,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
