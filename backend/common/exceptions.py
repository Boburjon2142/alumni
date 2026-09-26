from rest_framework.views import exception_handler

def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return response
    fields = response.data if isinstance(response.data, dict) else {"non_field_errors": response.data}
    response.data = {"success": False, "error": {"code": "VALIDATION_ERROR" if response.status_code == 400 else "REQUEST_ERROR",
        "message": "So‘rov ma’lumotlarini tekshiring." if response.status_code == 400 else "So‘rovni bajarib bo‘lmadi.", "fields": fields}}
    return response
