"""
Populates the database with a demo teacher, course, class, and roster
so the API / frontend can be exercised immediately after setup.

Usage: python seed.py
"""
from app.database.session import SessionLocal
from app.core.security import hash_password
from app.models import Teacher, Course, Class, Student

db = SessionLocal()

try:
    if db.query(Teacher).filter(Teacher.email == "haziq@example.com").first():
        print("Seed data already exists. Skipping.")
    else:
        teacher = Teacher(
            full_name="Muhammad Haziq",
            email="haziq@example.com",
            password_hash=hash_password("Password123!"),
            is_admin=False,
        )
        course = Course(name="Software Design and Architecture", code="SE-301")
        db.add_all([teacher, course])
        db.flush()

        cls = Class(name="BSSE-4A", section="A", course_id=course.id, teacher_id=teacher.id)
        db.add(cls)
        db.flush()

        students = [
            Student(full_name="Ali Raza", roll_number="242201", class_id=cls.id),
            Student(full_name="Hareem Shakeel", roll_number="242204", class_id=cls.id),
            Student(full_name="Sarosh Hussain", roll_number="242240", class_id=cls.id),
            Student(full_name="Mudassar Majeed", roll_number="242244", class_id=cls.id),
            Student(full_name="Muhammad Haziq", roll_number="242242", class_id=cls.id),
        ]
        db.add_all(students)
        db.commit()

        print("Seed complete.")
        print(f"  Teacher login: haziq@example.com / Password123!")
        print(f"  Class ID: {cls.id}")
finally:
    db.close()
