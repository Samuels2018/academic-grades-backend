import { api } from "./api";
import type { User } from "../types";

export const authService = {
  login: (username: string, password: string) =>
    api.post<User>("/auth/login/", { username, password }),
  logout: () => api.post<{ message: string }>("/auth/logout/"),
  me: () => api.get<User>("/auth/me/"),
};