# JWT Authentication Testing Guide

This guide explains how to test the JWT authentication implementation in Postman.

## Prerequisites

1. Make sure the backend server is running on `http://localhost:3000`
2. Open Postman

## Step-by-Step Testing Process

### 1. Register a New User

- **Endpoint**: `POST http://localhost:3000/api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "email": "test@example.com",
  "password": "Test123!@#",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

Expected response:
```json
{
  "message": "Registration successful. Please check your email for verification.",
  "email": "test@example.com"
}
```

### 2. Verify Email with OTP

Since we can't actually receive emails in testing, you'll need to check the console output where the backend is running to see the OTP that was "sent" via email.

- **Endpoint**: `POST http://localhost:3000/api/auth/verify-otp`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "email": "test@example.com",
  "otp": "THE_OTP_FROM_CONSOLE"
}
```

Expected response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "role": "client",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "is_verified": 1,
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  },
  "message": "Email verified successfully"
}
```

Save the `access_token` for subsequent requests.

### 3. Login (Alternative to Registration)

If you already have a verified user, you can log in directly:

- **Endpoint**: `POST http://localhost:3000/api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "email": "test@example.com",
  "password": "Test123!@#"
}
```

Expected response:
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": "client"
  },
  "statusCode": 201,
  "message": "Success"
}
```

### 4. Access Protected Routes

For any protected routes, you need to include the JWT token in the Authorization header:

- **Authorization Header**: `Bearer YOUR_ACCESS_TOKEN_HERE`
- **Example Endpoint**: `GET http://localhost:3000/api/users/1`

### 5. Logout

To logout and invalidate the token:

- **Endpoint**: `DELETE http://localhost:3000/api/auth/logout`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_ACCESS_TOKEN_HERE`

Expected response:
```json
{
  "message": "Successfully logged out"
}
```

## Common Issues and Solutions

1. **"Access token is missing"**: Make sure you're including the Authorization header with the Bearer token.

2. **"Invalid or expired token"**: The token may have expired (default is 1 hour) or is malformed.

3. **"Token has been revoked"**: This happens when you try to use a token after logging out.

## JWT Configuration

The JWT settings can be found in `.env`:
- Secret: `JWT_SECRET`
- Expiration: `JWT_EXPIRES_IN` (default: 1h)
- Refresh Secret: `JWT_REFRESH_SECRET`
- Refresh Expiration: `JWT_REFRESH_EXPIRES_IN` (default: 7d)