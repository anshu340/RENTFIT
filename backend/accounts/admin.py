# list_display = ('email', 'name', 'role', 'is_staff', 'is_active')
# list_filter = ('role', 'is_staff', 'is_active')
# search_fields = ('email', 'name')
# fieldsets = (
#     (None, {'fields': ('email', 'password')}),
#     ('Personal info', {'fields': ('name', 'role')}),
#     ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
#     ('Important dates', {'fields': ('last_login',)}),
# )
# add_fieldsets = (
#     (None, {
#         'classes': ('wide',),
#         'fields': ('email', 'name', 'role', 'password1', 'password2', 'is_staff', 'is_active')}
#     ),
# )

from django.contrib import admin
from .models import User, OTP

admin.site.register(User)
admin.site.register(OTP)

