"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { login, setAuth, isAuthenticated, getUserInfo } from "@/lib/api"
import { useEffect } from "react"

type LoginMode = "student" | "admin"

export default function LoginPage() {
  const router = useRouter()
  const [loginMode, setLoginMode] = useState<LoginMode>("student")
  const [studentId, setStudentId] = useState("")
  const [adminId, setAdminId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated()) {
      const userInfo = getUserInfo()
      if (userInfo?.role === "admin") {
        router.push("/admin")
      } else if (userInfo?.role === "student") {
        router.push("/dashboard")
      }
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (loginMode === "student") {
        if (!studentId || !password) {
          setError("Please fill in all fields")
          setIsLoading(false)
          return
        }

        const response = await login({
          student_id: studentId,
          password: password,
        })

        // Store authentication info
        setAuth(response.token, {
          user_id: response.user_id,
          username: response.username,
          role: response.role,
        })

        router.push("/dashboard")
      } else {
        if (!adminId || !password) {
          setError("Please fill in all fields")
          setIsLoading(false)
          return
        }

        const response = await login({
          admin_id: adminId,
          password: password,
        })

        // Store authentication info
        setAuth(response.token, {
          user_id: response.user_id,
          username: response.username,
          role: response.role,
        })

        router.push("/admin")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 text-primary-foreground"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
          </div>

          <div className="text-center">
            <CardTitle className="text-2xl font-bold">
              {loginMode === "student" ? "Student Login" : "Admin Login"}
            </CardTitle>
            <CardDescription className="mt-2">
              {loginMode === "student"
                ? "Access your TARUMT Lost & Found account"
                : "Administrative access to Lost & Found system"}
            </CardDescription>
          </div>

          {/* Toggle buttons */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button
              type="button"
              variant={loginMode === "student" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => {
                setLoginMode("student")
                setError("")
              }}
            >
              Student
            </Button>
            <Button
              type="button"
              variant={loginMode === "admin" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => {
                setLoginMode("admin")
                setError("")
              }}
            >
              Admin
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error message */}
            {error && (
              <Alert variant="destructive" className="animate-in fade-in-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Student ID / Admin ID field */}
            <div className="space-y-2">
              <Label htmlFor={loginMode === "student" ? "studentId" : "adminId"}>
                {loginMode === "student" ? "Student ID" : "Admin ID"}
              </Label>
              <Input
                id={loginMode === "student" ? "studentId" : "adminId"}
                type="text"
                placeholder={loginMode === "student" ? "Enter your Student ID" : "Enter Admin ID"}
                value={loginMode === "student" ? studentId : adminId}
                onChange={(e) => {
                  if (loginMode === "student") {
                    setStudentId(e.target.value)
                  } else {
                    setAdminId(e.target.value)
                  }
                  setError("")
                }}
                className="h-11"
                autoComplete={loginMode === "student" ? "username" : "username"}
                disabled={isLoading}
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                className="h-11"
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            {/* Submit button */}
            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Additional help text */}
            <p className="text-center text-sm text-muted-foreground mt-4">
              Please use your university credentials to log in.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
