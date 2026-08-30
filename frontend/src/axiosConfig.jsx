import axios from 'axios';

const axiosInstance = axios.create({
  //baseURL: 'http://localhost:5001', // local
  baseURL: 'http://13.211.174.176:5001', // live
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('authUser');
    const token = stored ? JSON.parse(stored).token : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // malformed/absent storage: send the request unauthenticated
  }
  return config;
});

export default axiosInstance;
