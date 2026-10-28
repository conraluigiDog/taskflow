from django.db.models import Count
from rest_framework import generics, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Category, Task
from .serializers import CategorySerializer, RegisterSerializer, TaskSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class OwnedModelViewSet(viewsets.ModelViewSet):
    """Cada usuário enxerga e altera apenas os próprios registros."""

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class CategoryViewSet(OwnedModelViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(owner=self.request.user)


class TaskViewSet(OwnedModelViewSet):
    serializer_class = TaskSerializer

    def get_queryset(self):
        qs = Task.objects.filter(owner=self.request.user).select_related("category")
        params = self.request.query_params
        if params.get("status"):
            qs = qs.filter(status=params["status"])
        if params.get("category"):
            qs = qs.filter(category_id=params["category"])
        if params.get("search"):
            qs = qs.filter(title__icontains=params["search"])
        return qs

    @action(detail=False, methods=["get"])
    def stats(self, request):
        rows = Task.objects.filter(owner=request.user).values("status").annotate(n=Count("id"))
        counts = {r["status"]: r["n"] for r in rows}
        return Response({s.value: counts.get(s.value, 0) for s in Task.Status})
