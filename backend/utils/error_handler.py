from functools import wraps
from django.http import JsonResponse
from django.http import Http404
import logging

logger = logging.getLogger(__name__)

class APIError(Exception):
    def __init__(self, message, status_code=400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

def handle_api_errors(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        try:
            return view_func(request, *args, **kwargs)
        except APIError as e:
            logger.warning(f"APIError {e.status_code}: {e.message}")
            return JsonResponse({"error": e.message}, status=e.status_code)
        except Http404 as e:
            message = str(e) if str(e) else "Recurso no encontrado"
            logger.warning(f"Http404: {message}")
            return JsonResponse({"error": message}, status=404)
        except Exception as e:
            logger.exception("Unhandled exception")
            return JsonResponse({"error": "Error interno del servidor"}, status=500)
    return wrapper