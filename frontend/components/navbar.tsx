"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Search } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { clearAuth } from "@/lib/api"

interface NavbarProps {
  role?: "student" | "admin"
}

export function Navbar({ role = "student" }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    clearAuth()
    router.push("/")
  }

  const isAdmin = role === "admin"
  const logoHref = isAdmin ? "/admin" : "/dashboard"

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-primary shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={logoHref} className="flex items-center gap-2">
          <div className="flex h-12 w-18 items-center justify-center rounded-lg bg-primary-foreground/10">
            <img src="/claimor.png" alt="Logo" className="h-12 w-18" />
          </div>
          <span className="text-balance text-lg font-semibold text-primary-foreground sm:text-xl">
            TARUMT Lost & Found
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {isAdmin ? (
            // Admin: Only show logout button
            <Button
              variant="secondary"
              className="ml-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              onClick={handleLogout}
            >
              Logout
            </Button>
          ) : (
            // Student: Show all navigation buttons
            <>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  Found Items
                </Button>
              </Link>
              <Link href="/my-claims">
                <Button
                  variant="ghost"
                  className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  My Claims
                </Button>
              </Link>
              <Link href="/report-item">
                <Button
                  variant="ghost"
                  className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  Report Item
                </Button>
              </Link>
              <Button
                variant="secondary"
                className="ml-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden rounded-lg p-2 text-primary-foreground hover:bg-primary-foreground/10"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-primary-foreground/20 bg-primary md:hidden">
          <div className="space-y-1 px-4 py-3">
            {isAdmin ? (
              // Admin: Only show logout button
              <Button
                variant="secondary"
                className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
              >
                Logout
              </Button>
            ) : (
              // Student: Show all navigation buttons
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    Found Items
                  </Button>
                </Link>
                <Link href="/my-claims" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    My Claims
                  </Button>
                </Link>
                <Link href="/report-item" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    Report Item
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleLogout()
                  }}
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
