import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { coursesService } from "../services/courses";
import { gradesService } from "../services/grades";
import type { Course, Grade } from "../types";

export function Dashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === "student") {
          const [coursesData, gradesData] = await Promise.all([
            coursesService.getMyCourses(),
            gradesService.getAll(),
          ]);
          setCourses(coursesData);
          setGrades(gradesData);
        } else {
          const [coursesData, gradesData] = await Promise.all([
            coursesService.getAll(),
            gradesService.getAll(),
          ]);
          setCourses(coursesData);
          setGrades(gradesData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando dashboard...</div>
      </div>
    );
  }

  const roleName = user?.role === "student" ? "Alumno" : user?.role === "teacher" ? "Profesor" : "Administrador";

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Dashboard - {roleName}</h2>
        <p className="text-gray-600">Bienvenido, <span className="font-medium">{user?.username}</span></p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Resumen de Cursos</h3>
        {courses.length === 0 ? (
          <p className="text-gray-500">No estás inscrito en ningún curso.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {courses.map((course) => (
              <li key={course.id} className="py-3 flex items-center">
                <span className="font-medium text-gray-800">{course.name}</span>
                {course.teacher && (
                  <span className="ml-3 text-sm text-gray-500">- Prof. {course.teacher}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {user?.role === "student" && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Mis Notas</h3>
          {grades.length === 0 ? (
            <p className="text-gray-500">No tienes notas registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Curso
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nota
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comentarios
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {grades.map((grade) => (
                    <tr key={grade.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-800">{grade.course}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`font-medium ${grade.score ? 'text-gray-900' : 'text-gray-400'}`}>
                          {grade.score ?? "Sin calificar"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{grade.comments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}