import axios from "axios"

const api = axios.create({
    baseURL:"http://localhost:3000",
})

api.interceptors.request.use((config)=>{
    const token = localStorage.getItem("token");
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
})

export const signup = (name: string, email: string, password: string) =>
  api.post("/auth/signup", { name, email, password });

export const signin = (email: string, password: string) =>
  api.post("/auth/signin", { email, password });

export const getNotes = () => api.get("/notes");
export const getNote = (id: string) => api.get(`/notes/${id}`);
export const createNote = (title: string, content: string) =>
  api.post("/notes", { title, content });
export const updateNote = (id: string, title: string, content: string) =>
  api.put(`/notes/${id}`, { title, content });
export const deleteNote = (id: string) => api.delete(`/notes/${id}`);

