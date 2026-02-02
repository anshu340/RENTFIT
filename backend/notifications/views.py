from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Notification
from .serializers import NotificationSerializer

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Limit to 20 most recent notifications for performance
        return Notification.objects.filter(user=self.request.user)[:20]

class MarkAsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        # Ensure user can only mark their own notifications as read
        notification = get_object_or_404(Notification, id=pk, user=request.user)
        notification.is_read = True
        notification.save()
        return Response({"status": "notification marked as read"}, status=status.HTTP_200_OK)

class MarkAllAsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"status": "all notifications marked as read"}, status=status.HTTP_200_OK)

class UnreadCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"unread_count": count}, status=status.HTTP_200_OK)
