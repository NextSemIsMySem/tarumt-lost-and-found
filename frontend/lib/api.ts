const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface LoginRequest {
  student_id?: string
  admin_id?: string
  password: string
}

export interface LoginResponse {
  status: string
  user_id: string
  username: string
  role: string
  token: string
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Login failed" }))
    throw new Error(error.detail || "Invalid credentials")
  }

  return response.json()
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export function getUserInfo(): { user_id: string; username: string; role: string } | null {
  if (typeof window === "undefined") return null
  const userInfo = localStorage.getItem("user_info")
  if (!userInfo) return null
  try {
    return JSON.parse(userInfo)
  } catch {
    return null
  }
}

export function setAuth(token: string, userInfo: { user_id: string; username: string; role: string }): void {
  if (typeof window === "undefined") return
  localStorage.setItem("auth_token", token)
  localStorage.setItem("user_info", JSON.stringify(userInfo))
}

export function clearAuth(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("auth_token")
  localStorage.removeItem("user_info")
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return !!getAuthToken() && !!getUserInfo()
}

