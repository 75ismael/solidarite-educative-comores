from rest_framework import permissions

class IsAdminOrCoordinator(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            (request.user.role in ['ADMIN', 'COORDINATOR'] or request.user.is_staff)
        )

class IsSafeguardingOfficer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            (request.user.role in ['SAFEGUARDING_OFFICER', 'ADMIN'] or request.user.is_superuser)
        )

class IsFinancialOfficer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            (request.user.role in ['FINANCIAL_OFFICER', 'ADMIN'] or request.user.is_superuser)
        )

class IsVolunteer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            request.user.role == 'VOLUNTEER'
        )

class IsParentOrTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            request.user.role in ['PARENT', 'TEACHER']
        )
