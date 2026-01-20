# Campus ID Authentication Flow

## Overview
This document describes the authentication and user management flow for the Campus ID system.

## User Types
- **Admin**: Institution administrators who manage students and lecturers
- **Lecturer**: Faculty members
- **Student**: Students enrolled in the institution

## Authentication Pages

### 1. Login (`/login`)
- **Endpoint**: `POST http://localhost:8000/api/auth/login`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "userType": "admin" | "lecturer" | "student"
  }
  ```
- **Response**: Returns user data, accessToken, and refreshToken
- **Redirect**: 
  - Admin → `/admin-dashboard`
  - Lecturer → `/lecturer-dashboard`
  - Student → `/dashboard`

### 2. Forgot Password (`/forgot-password`)
- **Endpoint**: `POST http://localhost:8000/api/auth/forgot-password`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "userType": "admin" | "lecturer" | "student"
  }
  ```
- **Response**: Confirmation that reset code was sent to email
- **Redirect**: Automatically redirects to `/reset-password` after 2 seconds

### 3. Reset Password (`/reset-password`)
- **Endpoint**: `POST http://localhost:8000/api/auth/reset-password`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "code": "123456",
    "newPassword": "newPassword123",
    "confirmPassword": "newPassword123"
  }
  ```
- **Response**: Confirmation that password was reset
- **Redirect**: Automatically redirects to `/login` after 2 seconds

## Admin Dashboard Features

### Profile Data
- **Endpoint**: `GET http://localhost:8000/api/users/profile`
- **Headers**: `Authorization: Bearer {accessToken}`
- **Response**: Returns user profile including name, avatar, university name, etc.
- **Usage**: Automatically fetched on dashboard load to display admin information

### Create Student Account
- **Endpoint**: `POST http://localhost:8000/api/admin/students`
- **Headers**: `Authorization: Bearer {accessToken}`
- **Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@university.edu",
    "department": "Computer Science",
    "year": "Freshman (Year 1)" | "Sophomore (Year 2)" | "Junior (Year 3)" | "Senior (Year 4)" | "Graduate Student"
  }
  ```
- **Response**: Returns created student data including studentId and defaultPassword
- **Note**: An activation email is automatically sent to the student

## Student Onboarding Flow

1. **Admin creates student account** via admin dashboard
2. **Student receives activation email** with:
   - Student ID
   - Default password
   - OTP code for verification
3. **Student verifies OTP** (TODO: Implementation pending)
   - Endpoint: `POST http://localhost:8000/api/auth/verify-otp`
   - Body: `{ "email": "student@university.edu", "code": "123456" }`
4. **Student logs in** using email and default password
5. **Student should change password** on first login (recommended)

## Token Management

### Storage
- `accessToken`: Stored in localStorage
- `refreshToken`: Stored in localStorage
- `user`: User data stored in localStorage

### Logout
- Clears all tokens and user data from localStorage
- Redirects to `/login`

### Token Expiration
- If API returns 401 Unauthorized, user is automatically logged out and redirected to login

## Security Features

- JWT-based authentication
- Password strength validation (minimum 8 characters)
- Secure token storage
- Automatic token cleanup on logout
- Protected routes with authentication checks

## API Base URL
All API endpoints use: `http://localhost:8000`

## Future Enhancements
- [ ] Implement OTP verification flow for students
- [ ] Add lecturer creation API integration
- [ ] Implement refresh token rotation
- [ ] Add password change functionality
- [ ] Implement session timeout warnings
