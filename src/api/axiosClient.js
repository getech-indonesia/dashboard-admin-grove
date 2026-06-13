import axios from 'axios'

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // URL API Backend dari environment variable
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // Pengaman agar tidak menggantung jika server down
})

// Pasang interceptor jika ke depannya ada sistem login
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default axiosClient