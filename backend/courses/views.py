import json
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404

from utils.error_handler import handle_api_errors, APIError
from utils.decorators import require_role
from .models import Course, Enrollment
from users.models import User


@login_required
@require_http_methods(["GET", "POST"])
@handle_api_errors
def course_list_create(request):
    if request.method == "GET":
        # Admin ve todos, profesor ve sus cursos, alumno ve cursos matriculados
        user = request.user
        if user.role == "admin":
            courses = Course.objects.all()
        elif user.role == "teacher":
            courses = Course.objects.filter(teacher=user)
        else:
            courses = user.enrolled_courses.all()
        data = [{"id": c.id, "name": c.name, "description": c.description,
                 "teacher": c.teacher.username if c.teacher else None} for c in courses]
        return JsonResponse(data, safe=False)

    elif request.method == "POST":
        require_role(["admin"])(lambda x: None)(request)  # lanza APIError si no es admin
        data = json.loads(request.body)
        name = data.get("name")
        teacher_id = data.get("teacher_id")
        if not name:
            raise APIError("El nombre del curso es obligatorio", 400)
        teacher = None
        if teacher_id:
            teacher = User.objects.filter(id=teacher_id, role="teacher").first()
            if not teacher:
                raise APIError("Profesor no encontrado", 404)
        course = Course.objects.create(name=name, description=data.get("description", ""), teacher=teacher)
        return JsonResponse({"id": course.id, "name": course.name}, status=201)


@login_required
@require_http_methods(["GET", "PUT", "DELETE"])
@handle_api_errors
def course_detail(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    user = request.user

    if request.method == "GET":
        if user.role == "admin" or user == course.teacher or course.students.filter(id=user.id).exists():
            data = {
                "id": course.id,
                "name": course.name,
                "description": course.description,
                "teacher": course.teacher.username if course.teacher else None,
                "students": list(course.students.values("id", "username"))
            }
            return JsonResponse(data)
        raise APIError("No tienes permiso para ver este curso", 403)

    if user.role != "admin" and user != course.teacher:
        raise APIError("No tienes permiso para modificar este curso", 403)

    if request.method == "PUT":
        data = json.loads(request.body)
        course.name = data.get("name", course.name)
        course.description = data.get("description", course.description)
        teacher_id = data.get("teacher_id")
        if teacher_id:
            course.teacher = get_object_or_404(User, id=teacher_id, role="teacher")
        course.save()
        return JsonResponse({"message": "Curso actualizado"})

    elif request.method == "DELETE":
        course.delete()
        return JsonResponse({"message": "Curso eliminado"})


@login_required
@require_http_methods(["POST"])
@handle_api_errors
def enroll_student(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    user = request.user

    if user.role != "admin" and user != course.teacher:
        raise APIError("No tienes permiso para matricular alumnos", 403)

    data = json.loads(request.body)
    student_id = data.get("student_id")
    student = get_object_or_404(User, id=student_id, role="student")
    Enrollment.objects.get_or_create(student=student, course=course)
    return JsonResponse({"message": "Alumno matriculado"})


@login_required
@require_http_methods(["GET"])
@handle_api_errors
def my_courses(request):
    user = request.user
    if user.role == "teacher":
        courses = user.taught_courses.all()
    elif user.role == "student":
        courses = user.enrolled_courses.all()
    else:
        courses = Course.objects.all()
    data = [{"id": c.id, "name": c.name} for c in courses]
    return JsonResponse(data, safe=False)