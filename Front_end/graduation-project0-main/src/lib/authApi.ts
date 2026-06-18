// ─────────────────────────────────────────────────────────────
//  Auth & Profile API Service
//  Base URL: http://localhost:9000/api/v1/auth
// ─────────────────────────────────────────────────────────────

const BASE =
"/api/v1/auth";

// ── Types ────────────────────────────────────────────────────
export interface User {
  user_id: string;
  name:    string;
  email:   string;
  verified: boolean;
}

export interface AuthTokens {
  access_token: string;
  // refresh_token comes as HTTP-only cookie automatically
}

export interface ApiError {
  message: string;
  error?:  string;
}

// ── Helper: base fetch wrapper ───────────────────────────────
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // needed for HTTP-only refresh token cookie
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error((data as ApiError).message || "Something went wrong");
  }

  return data as T;
}

// ════════════════════════════════════════════════════════════
//  1) Register
//  POST /register
//  Body: { name, email, password }
//  Returns: { message }  — no token returned
// ════════════════════════════════════════════════════════════
export async function register(name: string, email: string, password: string) {
  return request<{ message: string }>("/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

// ════════════════════════════════════════════════════════════
//  2) Verify account
//  GET /verify-account?code=CODE_FROM_EMAIL
// ════════════════════════════════════════════════════════════
export async function verifyAccount(code: string) {
  return request<{ message: string }>(`/verify-account?code=${code}`, {
    method: "GET",
  });
}

// ════════════════════════════════════════════════════════════
//  3) Resend verification
//  POST /resend-verification
//  Body: { email }
// ════════════════════════════════════════════════════════════
export async function resendVerification(email: string) {
  return request<{ message: string }>("/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// ════════════════════════════════════════════════════════════
//  4) Login
//  POST /login
//  Body: { email, password }
//  Returns: { message, access_token }
//  Note: refresh_token set as HTTP-only cookie automatically
// ════════════════════════════════════════════════════════════
export async function login(email: string, password: string) {
  return request<{ message: string; access_token: string }>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ════════════════════════════════════════════════════════════
//  5) Logout
//  GET /logout
// ════════════════════════════════════════════════════════════
export async function logout(token: string) {
  return request<{ message: string }>("/logout", { method: "GET" }, token);
}

// ════════════════════════════════════════════════════════════
//  6) Refresh token
//  GET /refresh-token
//  Uses HTTP-only cookie automatically
//  Returns: { message, access_token }
// ════════════════════════════════════════════════════════════
export async function refreshToken() {
  return request<{ message: string; access_token: string }>("/refresh-token", {
    method: "GET",
  });
}

// ════════════════════════════════════════════════════════════
//  7) Get profile
//  GET /profile
//  Requires: Authorization Bearer token
// ════════════════════════════════════════════════════════════
export async function getProfile(token: string) {
  return request<User>("/profile", { method: "GET" }, token);
}

// ════════════════════════════════════════════════════════════
//  8) Update profile name
//  PUT /profile-name
//  Body: { name }
// ════════════════════════════════════════════════════════════
export async function updateProfileName(name: string, token: string) {
  return request<{ message: string }>("/profile-name", {
    method: "PUT",
    body: JSON.stringify({ name }),
  }, token);
}

// ════════════════════════════════════════════════════════════
//  9) Change password (inside account — requires old password)
//  PUT /change-password-inside
//  Body: { oldPassword, newPassword }
// ════════════════════════════════════════════════════════════
export async function changePasswordInside(
  oldPassword: string,
  newPassword: string,
  token: string
) {
  return request<{ message: string }>("/change-password-inside", {
    method: "PUT",
    body: JSON.stringify({ oldPassword, newPassword }),
  }, token);
}

// ════════════════════════════════════════════════════════════
//  10) Forgot password (sends reset link to email)
//  POST /forgot-password
//  Body: { email }
// ════════════════════════════════════════════════════════════
export async function forgotPassword(email: string) {
  return request<{ message: string }>("/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// ════════════════════════════════════════════════════════════
//  11) Reset password by token (from email link)
//  POST /change-password?token=RESET_TOKEN
//  Body: { newPassword }
// ════════════════════════════════════════════════════════════
export async function resetPasswordByToken(
  resetToken: string,
  newPassword: string
) {
  return request<{ message: string }>(
    `/change-password?token=${resetToken}`,
    {
      method: "POST",
      body: JSON.stringify({ newPassword }),
    }
  );
}

// ════════════════════════════════════════════════════════════
//  12) Request email change
//  PUT /profile-email
//  Body: { email }  — sends verification to new email
// ════════════════════════════════════════════════════════════
export async function requestEmailChange(newEmail: string, token: string) {
  return request<{ message: string }>("/profile-email", {
    method: "PUT",
    body: JSON.stringify({ email: newEmail }),
  }, token);
}

// ════════════════════════════════════════════════════════════
//  13) Confirm email change
//  GET /profile-email-confirm?token=EMAIL_CHANGE_TOKEN
// ════════════════════════════════════════════════════════════
export async function confirmEmailChange(emailToken: string) {
  return request<{ message: string }>(
    `/profile-email-confirm?token=${emailToken}`,
    { method: "GET" }
  );
}

// ════════════════════════════════════════════════════════════
//  14) Delete profile
//  DELETE /profile
//  Body: { confirmation: "DELETE" }
// ════════════════════════════════════════════════════════════
export async function deleteProfile(token: string) {
  return request<{ message: string }>("/profile", {
    method: "DELETE",
    body: JSON.stringify({ confirmation: "DELETE" }),
  }, token);
}