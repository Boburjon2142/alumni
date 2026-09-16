from rest_framework import permissions
from apps.accounts.models import User


class IsStaffOrAdmin(permissions.BasePermission):
    """
    Allows access only to university staff or administrator roles.
    """
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_staff
                or request.user.is_superuser
                or request.user.role in [User.Role.STAFF, User.Role.ADMIN]
            )
        )


class IsAlumniOwnerOrStaff(permissions.BasePermission):
    """
    Allows access to the owner of the alumni profile or staff/admins.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_staff or request.user.role in [User.Role.STAFF, User.Role.ADMIN]:
            return True
        alumni = getattr(obj, "alumni", obj)
        return bool(alumni and alumni.user_id == request.user.id)
