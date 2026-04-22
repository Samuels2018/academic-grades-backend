import { api } from "./api";
import type { User } from "../types";

export const usersService = {
  getByRole: (role: "student" | "teacher" | "admin") =>
    api.get<User[]>(`/auth/users/?role=${role}`),
};
