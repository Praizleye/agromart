# Auth Endpoints

Base path: `/auth`

---

## POST /auth/register

Register a new normal user account. Sends a 6-digit OTP to the provided email.

**Auth required:** No

**Request body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "minLength8",
  "phone": "08012345678",
  "country_code": "234"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| first_name | string | Yes | |
| last_name | string | Yes | |
| email | string (email) | Yes | |
| password | string | Yes | Min 8 chars |
| phone | string | No | |
| country_code | string | No | Defaults to `"234"` |

**Response 201:**
```json
{
  "message": "Registration successful! Please check your email for the verification code.",
  "data": { "email": "john@example.com" },
  "success": true
}
```

**Errors:**
- `400` — Email already registered (verified or unverified)

---

## POST /auth/verify-email

Verify the OTP sent after registration. Returns JWT tokens on success.

**Auth required:** No

**Request body:**
```json
{
  "email": "john@example.com",
  "token": "482910"
}
```

**Response 201:**
```json
{
  "message": "Email verified successfully.",
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "user"
    }
  },
  "success": true
}
```

**Errors:**
- `400` — User not found / already verified / invalid or expired OTP

---

## POST /auth/resend-verification

Resend the email OTP. Always returns 201 to prevent email enumeration.

**Auth required:** No

**Request body:**
```json
{ "email": "john@example.com" }
```

**Response 201:**
```json
{
  "message": "A new verification code has been sent to your email.",
  "success": true
}
```

---

## POST /auth/login

Log in with email and password. Returns JWT tokens.

**Auth required:** No

**Request body:**
```json
{
  "email": "john@example.com",
  "password": "yourPassword"
}
```

**Response 200:**
```json
{
  "message": "Login successful.",
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "user"
    }
  },
  "success": true
}
```

**Errors:**
- `400` — Invalid credentials / email not verified
- `403` — Account deactivated

---

## POST /auth/forgot-password

Request a 6-digit password reset OTP. Always returns 200 to prevent email enumeration. OTP expires in **15 minutes**.

**Auth required:** No

**Request body:**
```json
{ "email": "john@example.com" }
```

**Response 200:**
```json
{
  "message": "If this email exists, a reset code has been sent.",
  "success": true
}
```

---

## POST /auth/reset-password

Reset password using the OTP from the forgot-password email.

**Auth required:** No

**Request body:**
```json
{
  "email": "john@example.com",
  "token": "391820",
  "new_password": "newPassword123"
}
```

**Response 200:**
```json
{
  "message": "Password reset successfully.",
  "success": true
}
```

**Errors:**
- `400` — Invalid or expired reset code

---

## POST /auth/refresh

Get a new access token using the current refresh token.

**Auth required:** `Authorization: Bearer <refresh_token>`

**Response 200:**
```json
{
  "message": "Tokens refreshed successfully.",
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ..."
  },
  "success": true
}
```

**Errors:**
- `401` — Invalid or missing refresh token
- `400` — Token does not match stored session

---

## POST /auth/complete-invite

Complete registration for a user who received an invitation. The invite token comes from the link in the invitation email. Invite expires in **48 hours**.

**Auth required:** No

**Request body:**
```json
{
  "token": "a3f8b2c1...",
  "first_name": "Jane",
  "last_name": "Smith",
  "password": "minLength8",
  "phone": "08098765432",
  "country_code": "234"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| token | string | Yes | From invite email link |
| first_name | string | Yes | |
| last_name | string | Yes | |
| password | string | Yes | Min 8 chars |
| phone | string | No | |
| country_code | string | No | Defaults to `"234"` |

**Response 201:**
```json
{
  "message": "Registration completed successfully.",
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "user": {
      "id": 5,
      "email": "jane@example.com",
      "first_name": "Jane",
      "last_name": "Smith",
      "role": "aggregator"
    }
  },
  "success": true
}
```

**Errors:**
- `400` — Invalid / already used / expired invitation token

---

## GET /auth/me

Get the authenticated user's full profile including extended profile data.

**Auth required:** `Authorization: Bearer <access_token>`

**Response 200:**
```json
{
  "message": "Profile fetched successfully.",
  "data": {
    "id": 1,
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user",
    "is_email_verified": true,
    "is_active": true,
    "profile": {
      "id": 1,
      "user_id": 1,
      "profile_picture_id": null,
      "metadata": {},
      "profile_picture": null
    }
  },
  "success": true
}
```

**Errors:**
- `401` — Missing or invalid access token
