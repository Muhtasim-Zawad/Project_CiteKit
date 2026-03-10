import axios from "axios";

const api = axios.create({
	baseURL: "http://localhost:8000",
});

// Add token to requests if available
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("access_token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

// Handle token refresh on 401
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			const refreshToken = localStorage.getItem("refresh_token");

			if (refreshToken) {
				try {
					const response = await api.post("/auth/refresh", {
						refresh_token: refreshToken,
					});
					const { access_token, refresh_token: newRefreshToken } =
						response.data;

					localStorage.setItem("access_token", access_token);
					localStorage.setItem("refresh_token", newRefreshToken);

					originalRequest.headers.Authorization = `Bearer ${access_token}`;
					return api(originalRequest);
				} catch {
					localStorage.removeItem("access_token");
					localStorage.removeItem("refresh_token");
					window.location.href = "/auth/login";
				}
			}
		}
		return Promise.reject(error);
	},
);

// Auth API functions
export const authAPI = {
	signup: (email, password, name) =>
		api.post("/auth/signup", { email, password, name }),

	login: (email, password) => api.post("/auth/login", { email, password }),

	logout: () => api.post("/auth/logout"),

	refreshToken: (refreshToken) =>
		api.post("/auth/refresh", { refresh_token: refreshToken }),

	resetPassword: (email) => api.post("/auth/reset-password", { email }),

	resendConfirmation: (email) =>
		api.post("/auth/resend-confirmation", { email }),
};

export default api;
