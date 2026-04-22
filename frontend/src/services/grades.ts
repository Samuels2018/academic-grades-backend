import { api } from "./api";
import type { Grade } from "../types";

export const gradesService = {
  getAll: () => api.get<Grade[]>("/grades/"),
  getById: (id: number) => api.get<Grade>(`/grades/${id}/`),
  getByCourse: (courseId: number) => api.get<Grade[]>(`/grades/course/${courseId}/`),
  createOrUpdate: (data: {
    student_id: number;
    course_id: number;
    score?: number;
    comments?: string;
  }) => api.post<{ id: number; message: string }>("/grades/", data),
  update: (id: number, data: { score?: number; comments?: string }) =>
    api.put<{ message: string }>(`/grades/${id}/`, data),
  delete: (id: number) => api.delete<{ message: string }>(`/grades/${id}/`),
};