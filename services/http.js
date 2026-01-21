import axios from "axios";

/* =========================
   Base Axios Instance
========================= */
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* =========================
   Request Interceptor
========================= */
http.interceptors.request.use(
  (config) => {
    // Attach token
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Request ID (useful for logs)
    config.headers["X-Request-Id"] = crypto.randomUUID();

    // Debug: log outgoing request (method, full URL, params/body)
    try {
      const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
      console.debug('[http] Request:', (config.method || '').toUpperCase(), fullUrl, config.params || config.data || {});
    } catch (e) {
      /* ignore logging errors */
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   Response Interceptor
========================= */
http.interceptors.response.use(
  (response) => {
    try {
      const cfg = response.config || {};
      const fullUrl = cfg.baseURL ? `${cfg.baseURL}${cfg.url}` : cfg.url;
      console.debug('[http] Response:', response.status, (cfg.method || '').toUpperCase(), fullUrl, response.data);
    } catch (e) {
      /* ignore logging errors */
    }

    return response.data; // always return data only
  },
  async (error) => {
    try {
      const cfg = error.config || {};
      const fullUrl = cfg.baseURL ? `${cfg.baseURL}${cfg.url}` : cfg.url;
      console.error('[http] Response Error:', error?.response?.status, (cfg.method || '').toUpperCase(), fullUrl, error?.message, error?.response?.data);
    } catch (e) {
      /* ignore logging errors */
    }

    // original error handling follows
    const original = error.config;

    // Token expired → refresh (PRO)
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        localStorage.setItem("access_token", res.data.accessToken);
        original.headers.Authorization = `Bearer ${res.data.accessToken}`;

        return http(original);
      } catch (err) {
        logout();
        return Promise.reject(err);
      }
    }

    // Global error shape
    return Promise.reject({
      status: error.response?.status,
      message:
        error.response?.data?.message ||
        error.message ||
        "Network Error",
    });
  }
);

function logout() {
  localStorage.clear();
  window.location.href = "/login";
}

export default http;
