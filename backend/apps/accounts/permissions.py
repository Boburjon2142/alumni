from rest_framework.permissions import BasePermission
from apps.accounts.models import User


class IsAdminOrStaffUser(BasePermission):
    """
    Allows access only to authenticated staff or admin users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_staff
                or request.user.is_superuser
                or request.user.role in [User.Role.ADMIN, User.Role.STAFF]
            )
        )

