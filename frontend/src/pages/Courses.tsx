import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { coursesService } from "../services/courses";
import { usersService } from "../services/users";
import type { Course, User } from "../types";

export function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", teacher_id: "" });
  const [teachers, setTeachers] = useState<User[]>([]);
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    try {
      const data = await coursesService.getAll();
      setCourses(data);
    } catch (err) {
      setError("Error al cargar cursos");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const data = await usersService.getByRole("teacher");
      setTeachers(data);
    } catch {
      setError("Error al cargar profesores");
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        teacher_id: formData.teacher_id ? parseInt(formData.teacher_id) : undefined,
      };
      if (editingCourse) {
        await coursesService.update(editingCourse.id, payload);
      } else {
        await coursesService.create(payload);
      }
      setShowForm(false);
      setEditingCourse(null);
      setFormData({ name: "", description: "", teacher_id: "" });
      fetchCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar curso");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este curso?")) return;
    try {
      await coursesService.delete(id);
      fetchCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  const startEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      description: course.description || "",
      teacher_id: course.teacher_id?.toString() || "",
    });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando cursos...</div>
      </div>
    );
  }

  const canModify = user?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Gestión de Cursos</h2>
        {canModify && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {showForm ? "Cancelar" : "Nuevo Curso"}
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
            {editingCourse ? "Editar Curso" : "Crear Curso"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profesor (opcional)
              </label>
              <select
                value={formData.teacher_id}
                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin asignar</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {editingCourse ? "Actualizar" : "Crear"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCourse(null);
                  setFormData({ name: "", description: "", teacher_id: "" });
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profesor</th>
                {canModify && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">{course.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-800">{course.name}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{course.description || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">{course.teacher || "Sin asignar"}</td>
                  {canModify && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(course)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
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