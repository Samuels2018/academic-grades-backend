from functools import wraps
from .error_handler import APIError

def require_role(allowed_roles):
    """Decorador para vistas que exige un rol específico."""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                raise APIError("Autenticación requerida", 401)
            if request.user.role not in allowed_roles:
                raise APIError("No tienes permiso para realizar esta acción", 403)
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator