"""
Import every model here so Alembic's autogenerate can discover them
through Base.metadata, and so `from app.models import Teacher` etc. works.
"""
from app.models.teacher import Teacher
from app.models.student import Student
from app.models.course import Course
from app.models.class_model import Class
from app.models.attendance import Attendance, AttendanceStatus

__all__ = ["Teacher", "Student", "Course", "Class", "Attendance", "AttendanceStatus"]
