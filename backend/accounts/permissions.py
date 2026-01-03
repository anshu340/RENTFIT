
# Custom permissions for role-based access control in RentFit

from rest_framework import permissions


class IsCustomer(permissions.BasePermission):
    """
    Permission to check if the user is a Customer
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'Customer'
        )


class IsStore(permissions.BasePermission):
    """
    Permission to check if the user is a Store
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'Store'
        )


class IsAdmin(permissions.BasePermission):
    """
    Permission to check if the user is an Admin
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'Admin'
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission to allow users to only access their own data
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Write permissions are only allowed to the owner
        return obj == request.user


class IsCustomerOwner(permissions.BasePermission):
    """
    Permission to check if the authenticated user is the owner of the customer profile
    """
    def has_object_permission(self, request, view, obj):
        return (
            request.user.is_authenticated and
            obj == request.user and
            request.user.role == 'Customer'
        )


class IsStoreOwner(permissions.BasePermission):
    """
    Permission to check if the authenticated user is the owner of the store profile
    """
    def has_object_permission(self, request, view, obj):
        return (
            request.user.is_authenticated and
            obj == request.user and
            request.user.role == 'Store'
        )