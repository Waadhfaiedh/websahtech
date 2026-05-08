import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
    // Handle rate limiting (429)
    if (error.response?.status === 429) {
      const retryAfterStr = error.response.data?.retryAfter || "60 seconds";
      const retryAfterNum = parseInt(retryAfterStr.match(/\d+/)?.[0] || "60");

      return Promise.reject({
        isRateLimit: true,
        message:
          "Trop de tentatives. Veuillez réessayer dans " +
          retryAfterNum +
          " secondes.",
        retryAfter: retryAfterNum,
      });
    }

    // Handle token refresh on 401
    if (error.response?.status === 401) {
      const user = JSON.parse(localStorage.getItem("sahtech_user") || "{}");
      if (user.refreshToken) {
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
      }
    }
    return Promise.reject(error);
  },
);

export default api;
