import json

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

from utils.error_handler import APIError, handle_api_errors


@ensure_csrf_cookie
@require_http_methods(["POST"])
@handle_api_errors
def login_view(request):
    data = json.loads(request.body)
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        raise APIError("Usuario y contraseña son obligatorios", 400)
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return JsonResponse({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
        })
    raise APIError("Credenciales inválidas", 401)


@require_http_methods(["POST"])
@handle_api_errors
def logout_view(request):
    logout(request)
    return JsonResponse({"message": "Sesión cerrada"})


@ensure_csrf_cookie
@require_http_methods(["GET"])
@handle_api_errors
def current_user(request):
    if not request.user.is_authenticated:
        raise APIError("Autenticación requerida", 401)

    user = request.user
    return JsonResponse({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
    })


@require_http_methods(["GET"])
@handle_api_errors
def users_by_role(request):
    if not request.user.is_authenticated:
        raise APIError("Autenticación requerida", 401)

    role = request.GET.get("role")
    allowed_roles = {"student", "teacher", "admin"}
    if role not in allowed_roles:
        raise APIError("Parámetro 'role' inválido", 400)

    users = (
        request.user.__class__.objects.filter(role=role)
        .values("id", "username", "email", "role")
        .order_by("username")
    )
    return JsonResponse(list(users), safe=False)
