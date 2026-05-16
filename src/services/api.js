import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let authLogoutHandler = null;

export const setAuthLogoutHandler = (handler) => {
  authLogoutHandler = handler;
};

const triggerLogout = () => {
  if (typeof authLogoutHandler === "function") {
    authLogoutHandler();
  }
};

const isAuthInvalidationError = (error) => {
  const message = String(
    error.response?.data?.message || error.message || "",
  ).toLowerCase();
  const status = error.response?.status;

  return (
    (status === 409 && message.includes("invalid refresh token")) ||
    message.includes("user not found") ||
    message.includes("refresh token failed") ||
    message.includes("refresh token failde") ||
    message.includes("refresh token fail")
  );
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

// automatically add token to every request
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("sahtech_user") || "{}");
  if (user.accessToken) {
    config.headers.Authorization = `Bearer ${user.accessToken}`;
  }
  return config;
});

// automatically refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (isAuthInvalidationError(error)) {
      triggerLogout();
      throw error;
    }

    // Handle rate limiting (429)
    if (error.response?.status === 429) {
      const retryAfterStr = error.response.data?.retryAfter || "60 seconds";
      const retryAfterNum = Number.parseInt(
        retryAfterStr.match(/\d+/)?.[0] || "60",
        10,
      );
      const rateLimitError = new Error(
        "Trop de tentatives. Veuillez réessayer dans " +
          retryAfterNum +
          " secondes.",
      );

      rateLimitError.isRateLimit = true;
      rateLimitError.retryAfter = retryAfterNum;

      throw rateLimitError;
    }

    // Handle token refresh on 401
    if (error.response?.status === 401) {
      const user = JSON.parse(localStorage.getItem("sahtech_user") || "{}");
      if (user.refreshToken) {
        try {
          const { data } = await axios.post(
            `${API_BASE_URL}/users/refresh-token`,
            {
              refreshToken: user.refreshToken,
            },
          );
          user.accessToken = data.accessToken;
          localStorage.setItem("sahtech_user", JSON.stringify(user));
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return axios(error.config);
        } catch (refreshError) {
          if (isAuthInvalidationError(refreshError)) {
            triggerLogout();
          }
          throw refreshError;
        }
      }

      triggerLogout();
    }
    throw error;
  },
);

export default api;
