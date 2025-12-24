from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer, CustomerSerializer, StoreSerializer
from .models import Customer, Store

# Root API view to handle GET /api/
class APIRootView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            "message": "Welcome to Rentfit API",
            "endpoints": {
                "register": "/api/register/",
                "login": "/api/login/",
                "customer_dashboard": "/api/dashboard/customer/",
                "store_dashboard": "/api/dashboard/store/"
            }
        })


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Registered successfully"})


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        token = RefreshToken.for_user(user)

        return Response({
            "access": str(token.access_token),
            "refresh": str(token),
            "role": user.role
        })


class CustomerDashboard(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'customer':
            return Response({"error": "Not allowed"})
        try:
            customer = Customer.objects.get(user=request.user)
        except Customer.DoesNotExist:
            return Response({"error": "Customer profile not found"})
        return Response(CustomerSerializer(customer).data)


class StoreDashboard(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'store':
            return Response({"error": "Not allowed"})
        try:
            store = Store.objects.get(user=request.user)
        except Store.DoesNotExist:
            return Response({"error": "Store profile not found"})
        return Response(StoreSerializer(store).data)
