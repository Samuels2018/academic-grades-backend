import { useEffect, useState } from "react";
import { coursesService } from "../services/courses";
import { usersService } from "../services/users";
import type { Course, User } from "../types";

export function AdminPanel() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollForm, setEnrollForm] = useState({ courseId: "", studentId: "" });

  const fetchCourses = async () => {
    try {
      const [coursesData, studentsData] = await Promise.all([
        coursesService.getAll(),
        usersService.getByRole("student"),
      ]);
      setCourses(coursesData);
      setStudents(studentsData);
    } catch (err) {
      setError("Error al cargar cursos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await coursesService.enrollStudent(
        parseInt(enrollForm.courseId),
        parseInt(enrollForm.studentId)
      );
      alert("Alumno matriculado exitosamente");
      setEnrollForm({ courseId: "", studentId: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al matricular");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando panel...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Panel de Administración</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Matricular Alumno en Curso</h3>
          <form onSubmit={handleEnroll} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
              <select
                value={enrollForm.courseId}
                onChange={(e) => setEnrollForm({ ...enrollForm, courseId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un curso</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alumno</label>
              <select
                value={enrollForm.studentId}
                onChange={(e) => setEnrollForm({ ...enrollForm, studentId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un alumno</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>{student.username}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Matricular
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Estadísticas rápidas</h3>
          <div className="space-y-2 text-gray-700">
            <p>Total de cursos: <span className="font-semibold">{courses.length}</span></p>
            <p>Acceso completo a todas las funciones de gestión.</p>
            <p className="text-sm text-gray-500 mt-4">
              Utilice las secciones "Cursos" y "Notas" para administrar el sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}