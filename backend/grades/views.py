import json

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_http_methods

from courses.models import Course
from users.models import User
from utils.error_handler import APIError, handle_api_errors

from .models import Grade


@login_required
@require_http_methods(["GET", "POST"])
@handle_api_errors
def grade_list(request):
    user = request.user

    if request.method == "GET":
        if user.role == "student":
            grades = Grade.objects.filter(student=user)
        elif user.role == "teacher":
            grades = Grade.objects.filter(course__teacher=user)
        else:  # admin
            grades = Grade.objects.all()
        data = [
            {
                "id": g.id,
                "student": g.student.username,
                "course": g.course.name,
                "score": float(g.score) if g.score else None,
                "comments": g.comments,
            }
            for g in grades
        ]
        return JsonResponse(data, safe=False)

    elif request.method == "POST":
        # Solo admin o profesor del curso pueden crear nota
        data = json.loads(request.body)
        student_id = data.get("student_id")
        course_id = data.get("course_id")
        score = data.get("score")
        comments = data.get("comments", "")

        student = get_object_or_404(User, id=student_id, role="student")
        course = get_object_or_404(Course, id=course_id)

        if user.role != "admin" and user != course.teacher:
            raise APIError("No tienes permiso para asignar notas en este curso", 403)

        grade, created = Grade.objects.update_or_create(
            student=student, course=course,
            defaults={"score": score, "comments": comments}
        )
        return JsonResponse({"id": grade.id, "message": "Nota guardada"}, status=201)


@login_required
@require_http_methods(["GET", "PUT", "DELETE"])
@handle_api_errors
def grade_detail(request, grade_id):
    grade = get_object_or_404(Grade, id=grade_id)
    user = request.user

    if request.method == "GET":
        if user.role == "student" and grade.student != user:
            raise APIError("No puedes ver notas de otros alumnos", 403)
        elif user.role == "teacher" and grade.course.teacher != user:
            raise APIError("No eres profesor de este curso", 403)
        return JsonResponse({
            "id": grade.id,
            "student": grade.student.username,
            "course": grade.course.name,
            "score": float(grade.score) if grade.score else None,
            "comments": grade.comments,
        })

    # Escritura: admin o profesor del curso
    if user.role != "admin" and user != grade.course.teacher:
        raise APIError("No tienes permiso para modificar esta nota", 403)

    if request.method == "PUT":
        data = json.loads(request.body)
        if "score" in data:
            grade.score = data["score"]
        if "comments" in data:
            grade.comments = data["comments"]
        grade.save()
        return JsonResponse({"message": "Nota actualizada"})

    elif request.method == "DELETE":
        grade.delete()
        return JsonResponse({"message": "Nota eliminada"})


@login_required
@require_http_methods(["GET"])
@handle_api_errors
def course_grades(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    user = request.user

    # Permisos: admin, profesor del curso, o alumno matriculado (solo ve sus propias notas)
    if user.role == "admin" or user == course.teacher:
        grades = Grade.objects.filter(course=course)
    elif user.role == "student" and course.students.filter(id=user.id).exists():
        grades = Grade.objects.filter(course=course, student=user)
    else:
        raise APIError("No tienes acceso a las notas de este curso", 403)

    data = [
        {
            "id": g.id,
            "student": g.student.username,
            "score": float(g.score) if g.score else None,
            "comments": g.comments,
        }
        for g in grades
    ]
    return JsonResponse(data, safe=False)
