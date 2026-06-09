# Postman API Testing Guide

## Base URL
```
http://localhost:5000/api/v1/auth
```

---

## 1. REGISTER ENDPOINT

### Request Details:
- **Method**: POST
- **URL**: `http://localhost:5000/api/v1/auth/register`
- **Content-Type**: `application/json`

### Request Body (JSON):
```json
{
  "firstName": "Alex",
  "lastName": "Rivers",
  "username": "trailblazer_99",
  "email": "alex@trailidea.com",
  "password": "SecurePassword123"
}
```

### Success Response (200 OK):
```json
{
  "status": 200,
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "Alex",
      "lastName": "Rivers",
      "username": "trailblazer_99",
      "email": "alex@trailidea.com",
      "role": "user",
      "createdAt": "2026-06-09T15:52:00.000Z",
      "updatedAt": "2026-06-09T15:52:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Response (400 Bad Request):
```json
{
  "status": 400,
  "success": false,
  "message": "Email already exists",
  "data": null
}
```

### Validation Rules:
- **firstName**: 2-40 characters, only letters/spaces/hyphens/apostrophes
- **lastName**: 2-40 characters, only letters/spaces/hyphens/apostrophes
- **username**: 3-30 characters, only letters/numbers/underscores
- **email**: Must be valid email format, unique
- **password**: Min 8 characters, at least 1 uppercase, 1 lowercase, 1 number

---

## 2. LOGIN ENDPOINT

### Request Details:
- **Method**: POST
- **URL**: `http://localhost:5000/api/v1/auth/login`
- **Content-Type**: `application/json`

### Request Body (JSON):
```json
{
  "email": "alex@trailidea.com",
  "password": "SecurePassword123"
}
```

### Success Response (200 OK):
```json
{
  "status": 200,
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "Alex",
      "lastName": "Rivers",
      "username": "trailblazer_99",
      "email": "alex@trailidea.com",
      "role": "user",
      "createdAt": "2026-06-09T15:52:00.000Z",
      "updatedAt": "2026-06-09T15:52:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Error Response (400 Bad Request):
```json
{
  "status": 400,
  "success": false,
  "message": "Invalid email",
  "data": null
}
```

### Validation Rules:
- **email**: Must be valid email format
- **password**: Min 6 characters

---

## 3. RESPONSE FORMAT EXPLANATION

### Success Response Structure:
```
{
  "status": 200,                    // HTTP Status Code
  "success": true,                  // Operation success flag
  "message": "User created...",     // Human-readable message
  "data": {                         // Actual response data
    "user": {...},                  // User object
    "token": "jwt_token_here"       // JWT Authentication token (30 days expiry)
  }
}
```

### Error Response Structure:
```
{
  "status": 400,                    // HTTP Status Code
  "success": false,                 // Operation success flag
  "message": "Email already exists", // Error message
  "data": null                      // No data on error
}
```

---

## 4. TOKEN USAGE

After successful login/register, use the token in subsequent requests:

### Adding Token to Headers:
```
Authorization: Bearer <your_jwt_token>
```

### Token Details:
- **Algorithm**: HS256
- **Expiry**: 30 days
- **Payload Contains**:
  - User ID (_id)
  - Email
  - Role (user/admin)

---

## 5. STEPS TO TEST IN POSTMAN

### Step 1: Register a New User
1. Open Postman
2. Create new request
3. Set method to **POST**
4. Enter URL: `http://localhost:5000/api/v1/auth/register`
5. Go to **Body** tab
6. Select **raw** → **JSON**
7. Paste the register body above
8. Click **Send**

### Step 2: Login with Created User
1. Create new request
2. Set method to **POST**
3. Enter URL: `http://localhost:5000/api/v1/auth/login`
4. Go to **Body** tab
5. Select **raw** → **JSON**
6. Paste the login body
7. Click **Send**
8. Copy the token from response

### Step 3: Save Token (Optional)
1. In Postman, go to **Tests** tab
2. Add script:
```javascript
var jsonData = pm.response.json();
pm.environment.set("authToken", jsonData.data.token);
```
3. Now use `{{authToken}}` in future requests

---

## 6. ERROR CODES

| Status | Message | Meaning |
|--------|---------|---------|
| 200 | User created successfully | Registration successful |
| 200 | Login successful | Login successful |
| 400 | Email already exists | Email is taken |
| 400 | Username already exists | Username is taken |
| 400 | Invalid email | Email doesn't exist on login |
| 400 | Invalid password | Password is wrong |
| 400 | Validation errors | Schema validation failed |
| 500 | Internal Server Error | Server-side error |

---

## 7. FRONTEND INTEGRATION

The frontend sends data to:
- **Register**: `http://localhost:5000/api/v1/auth/register`
- **Login**: `http://localhost:5000/api/v1/auth/login`

After successful response:
1. Token stored in `localStorage.authToken`
2. User object stored in `localStorage.user`
3. Redirect to `/dashboard`

---

## 8. COMMON ISSUES

### CORS Error
**Solution**: Backend already has CORS configured for `http://localhost:3000`

### Connection Refused
**Solution**: Make sure backend is running on port 5000:
```bash
cd backend
npm run dev
```

### Invalid JWT
**Solution**: Token expires after 30 days. User needs to login again.

---
