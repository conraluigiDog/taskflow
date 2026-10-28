from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Category, Task


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]

    def validate_name(self, value):
        user = self.context["request"].user
        qs = Category.objects.filter(owner=user, name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Você já tem uma categoria com esse nome.")
        return value


class TaskSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True, default=None)

    class Meta:
        model = Task
        fields = ["id", "title", "description", "status", "category", "category_name", "due_date", "created_at"]
        read_only_fields = ["created_at"]

    def validate_category(self, value):
        if value and value.owner != self.context["request"].user:
            raise serializers.ValidationError("Categoria inválida.")
        return value
