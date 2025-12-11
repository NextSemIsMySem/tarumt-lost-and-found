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

export interface Item {
  item_id: string
  item_name: string
  description: string
  status: string
  date_reported: string
  category_name: string
  location_name: string
  image_url?: string | null
}

export interface Category {
  category_id: string
  category_name: string
}

export interface Location {
  location_id: string
  location_name: string
}

export interface ClaimPayload {
  item_id: string
  student_id: string
  proof_of_ownership: string
}

export interface StudentClaim {
  claim_id: string
  item_id: string
  item_name: string
  date_claimed: string
  claim_status: string
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

export async function getItems(params?: { search?: string; category_id?: string; item_id?: string }): Promise<Item[]> {
  const query = new URLSearchParams()
  if (params?.search) query.set("search", params.search)
  if (params?.category_id) query.set("category_id", params.category_id)
  if (params?.item_id) query.set("item_id", params.item_id)

  const response = await fetch(`${API_BASE_URL}/items${query.toString() ? `?${query.toString()}` : ""}`)
  if (!response.ok) {
    throw new Error("Failed to fetch items")
  }
  return response.json()
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/categories`)
  if (!response.ok) {
    throw new Error("Failed to fetch categories")
  }
  return response.json()
}

export async function getLocations(): Promise<Location[]> {
  const response = await fetch(`${API_BASE_URL}/locations`)
  if (!response.ok) {
    throw new Error("Failed to fetch locations")
  }
  return response.json()
}

export async function submitClaim(payload: ClaimPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/claims`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to submit claim" }))
    throw new Error(error.detail || "Failed to submit claim")
  }
}

export async function getStudentClaims(studentId: string): Promise<StudentClaim[]> {
  const response = await fetch(`${API_BASE_URL}/students/${studentId}/claims`)
  if (!response.ok) {
    throw new Error("Failed to fetch claims")
  }
  return response.json()
}

export async function deleteClaim(claimId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/claims/${claimId}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to delete claim" }))
    throw new Error(error.detail || "Failed to delete claim")
  }
}

export async function getAdminStats(): Promise<{
  total_items: number
  total_claimed: number
  pending_claims: number
}> {
  const response = await fetch(`${API_BASE_URL}/admin/stats`)
  if (!response.ok) {
    throw new Error("Failed to fetch admin stats")
  }
  return response.json()
}

export async function getAdminClaims(): Promise<
  {
    claim_id: string
    proof_of_ownership: string
    date_claimed: string
    claim_status: string
    item_name: string
    item_id: string
    claimant_name: string
  }[]
> {
  const response = await fetch(`${API_BASE_URL}/admin/claims`)
  if (!response.ok) {
    throw new Error("Failed to fetch admin claims")
  }
  return response.json()
}

export async function processAdminClaim(payload: {
  claim_id: string
  admin_id: string
  status: "Approved" | "Rejected"
}): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/claims`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to update claim" }))
    throw new Error(error.detail || "Failed to update claim")
  }
}

export interface ClaimHistory {
  claim_id: string
  proof_of_ownership: string
  date_claimed: string
  claim_status: string
  admin_id: string | null
  item_id: string
  item_name: string
  item_description: string
  image_url: string | null
  date_reported: string
  location_id: string
  location_name: string
  category_id: string
  category_name: string
  claimant_id: string
  claimant_name: string
  claimant_email: string
  admin_name: string | null
  admin_email: string | null
}

export async function getClaimsHistory(): Promise<ClaimHistory[]> {
  const response = await fetch(`${API_BASE_URL}/admin/claims/history`)
  if (!response.ok) {
    throw new Error("Failed to fetch claims history")
  }
  return response.json()
}

export interface ReportItemPayload {
  item_name: string
  description: string
  category_id: string
  location_id: string
  student_id: string
  image_url?: string | null
}

export async function submitFoundItem(payload: ReportItemPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to submit item" }))
    throw new Error(error.detail || "Failed to submit item")
  }
}

export async function deleteItem(itemId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/items/${itemId}`, { method: "DELETE" })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to delete item" }))
    throw new Error(error.detail || "Failed to delete item")
  }
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to upload image" }))
    throw new Error(error.detail || "Failed to upload image")
  }

  const data = await response.json()
  return data.url
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

