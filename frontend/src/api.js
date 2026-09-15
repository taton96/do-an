import axios from "axios";
const api=axios.create({baseURL:import.meta.env.VITE_API_URL||"http://localhost:3000/api",headers:{"Content-Type":"application/json"}});
api.interceptors.request.use(c=>{const token=localStorage.getItem("token");if(token)c.headers.Authorization=`Bearer ${token}`;return c});
export default api;