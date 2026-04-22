import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { gradesService } from "../services/grades";
import { coursesService } from "../services/courses";
import { usersService } from "../services/users";
import type { Grade, Course, User } from "../types";

export function Grades() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [formData, setFormData] = useState({
    student_id: "",
    course_id: "",
    score: "",
    comments: "",
  });

  const fetchData = async () => {
    try {
      const [gradesData, coursesData, studentsData] = await Promise.all([
        gradesService.getAll(),
        coursesService.getAll(),
        usersService.getByRole("student"),
      ]);
      setGrades(gradesData);
      setCourses(coursesData);
      setStudents(studentsData);
    } catch (err) {
      setError("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        student_id: parseInt(formData.student_id),
        course_id: parseInt(formData.course_id),
        score: formData.score ? parseFloat(formData.score) : undefined,
        comments: formData.comments,
      };
      if (editingGrade) {
        await gradesService.update(editingGrade.id, {
          score: payload.score,
          comments: payload.comments,
        });
      } else {
        await gradesService.createOrUpdate(payload);
      }
      setShowForm(false);
      setEditingGrade(null);
      setFormData({ student_id: "", course_id: "", score: "", comments: "" });
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar nota");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar esta nota?")) return;
    try {
      await gradesService.delete(id);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  const startEdit = (grade: Grade) => {
    setEditingGrade(grade);
    setFormData({
      student_id: grade.student_id?.toString() || "",
      course_id: grade.course_id?.toString() || "",
      score: grade.score?.toString() || "",
      comments: grade.comments,
    });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando notas...</div>
      </div>
    );
  }

  const canModify = user?.role === "admin" || user?.role === "teacher";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Gestión de Notas</h2>
        {canModify && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {showForm ? "Cancelar" : "Nueva Nota"}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {showForm && canModify && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {editingGrade ? "Editar Nota" : "Crear Nota"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante</label>
              <select
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                required={!editingGrade}
                disabled={!!editingGrade}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Seleccione un estudiante</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>{student.username}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
              <select
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                required={!editingGrade}
                disabled={!!editingGrade}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Seleccione un curso</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nota (0-100)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios</label>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {editingGrade ? "Actualizar" : "Crear"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingGrade(null);
                  setFormData({ student_id: "", course_id: "", score: "", comments: "" });
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nota</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comentarios</th>
                {canModify && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {grades.map((grade) => (
                <tr key={grade.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">{grade.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-800">{grade.student}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">{grade.course}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`font-medium ${grade.score ? 'text-gray-900' : 'text-gray-400'}`}>
                      {grade.score ?? "Sin calificar"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{grade.comments || "-"}</td>
                  {canModify && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(grade)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(grade.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}