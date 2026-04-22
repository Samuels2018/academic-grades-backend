import { api } from "./api";
import type { Course } from "../types";

export const coursesService = {
  getAll: () => api.get<Course[]>("/courses/"),
  getMyCourses: () => api.get<Course[]>("/courses/my-courses/"),
  getById: (id: number) => api.get<Course>(`/courses/${id}/`),
  create: (data: { name: string; description?: string; teacher_id?: number }) =>
    api.post<Course>("/courses/", data),
  update: (id: number, data: Partial<Course>) =>
    api.put<{ message: string }>(`/courses/${id}/`, data),
  delete: (id: number) =>
    api.delete<{ message: string }>(`/courses/${id}/`),
  enrollStudent: (courseId: number, studentId: number) =>
    api.post<{ message: string }>(`/courses/${courseId}/enroll/`, { student_id: studentId }),
};