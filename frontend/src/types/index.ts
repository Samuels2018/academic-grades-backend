export interface User {
  id: number;
  username: string;
  email: string;
  role: "student" | "teacher" | "admin";
}

export interface Course {
  id: number;
  name: string;
  description?: string;
  teacher?: string;
  teacher_id?: number;
}

export interface Grade {
  id: number;
  student: string;
  student_id?: number;
  course: string;
  course_id?: number;
  score: number | null;
  comments: string;
}

export interface Enrollment {
  student_id: number;
  course_id: number;
}