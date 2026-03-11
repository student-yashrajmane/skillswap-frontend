import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:9070/SkillSwap'
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
