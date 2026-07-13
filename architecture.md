# Architecture.md

# Marks Entry System – Attendance Module (Teacher Side)

**Project:** Marks Entry System  
**Module:** Attendance Module (Teacher Side)  
**Team:** Group 22  
**Developer:** Muhammad Haziq  
**Technology Stack:** React + FastAPI + PostgreSQL

## Overview
The Attendance Module is a standalone feature of the Marks Entry System responsible for allowing teachers to record, update, and view student attendance for their assigned classes.

## High-Level Architecture

```text
React Client
    ↓
 REST API
    ↓
 FastAPI
    ↓
 Service Layer
    ↓
 Repository Layer
    ↓
 PostgreSQL
```

## Frontend Structure

```text
src/
├── api/
├── components/
├── features/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── services/
├── store/
├── types/
└── utils/
```

## Backend Structure

```text
app/
├── api/
├── core/
├── database/
├── middleware/
├── models/
├── repositories/
├── schemas/
├── services/
└── utils/
```

## Request Flow

```text
Teacher
 ↓
React UI
 ↓
Axios
 ↓
FastAPI Router
 ↓
Service
 ↓
Repository
 ↓
PostgreSQL
```

## Authentication

- JWT Authentication
- Role-based Authorization
- BCrypt Password Hashing

## REST Endpoints

- GET /teacher/classes
- GET /classes/{id}/students
- GET /attendance
- POST /attendance
- PUT /attendance/{id}
- DELETE /attendance/{id}

## Database Entities

- Teacher
- Student
- Course
- Class
- Attendance

Attendance Status:
- Present
- Absent
- Late
- Leave

## Validation

- Teacher must own the class
- Future dates are blocked
- Duplicate attendance prevented
- Every student requires a status

## Scalability

Future support for:
- Student Portal
- Parent Portal
- Admin Dashboard
- Attendance Analytics
- Notifications
- Report Generation

## Principles

- Clean Architecture
- SOLID
- DRY
- Separation of Concerns
- REST API Best Practices
