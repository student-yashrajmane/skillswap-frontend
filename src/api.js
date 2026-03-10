import axios from 'axios';

const api = axios.create({
    baseURL: 'https://backend-skillswap-production-2eb9.up.railway.app'
});

// ✅ Attach token ONLY if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Optional response interceptor (keep it)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


export default api;
