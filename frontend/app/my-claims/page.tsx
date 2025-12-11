"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { getStudentClaims, getUserInfo, deleteClaim } from "@/lib/api"

type ClaimStatus = "Pending" | "Approved" | "Rejected"

interface Claim {
  id: string
  itemName: string
  dateClaimed: string
  status: ClaimStatus
}

export default function MyClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const user = getUserInfo()

    if (!user || user.role !== "student") {
      setError("Please log in as a student to view your claims.")
      setIsLoading(false)
      return
    }

    const loadClaims = async () => {
      try {
        const data = await getStudentClaims(user.user_id)
        setClaims(
          data.map((claim) => ({
            id: claim.claim_id,
            itemName: claim.item_name,
            dateClaimed: claim.date_claimed,
            status: claim.claim_status as ClaimStatus,
          }))
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load claims.")
      } finally {
        setIsLoading(false)
      }
    }

    loadClaims()
  }, [])

  const handleDelete = async (claimId: string) => {
    // Find the claim to show in confirmation message
    const claim = claims.find((c) => c.id === claimId)
    const itemName = claim?.itemName || "this claim"
    
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete your claim for "${itemName}"?\n\nThis action cannot be undone.`
    )
    
    if (!confirmed) {
      return // User cancelled, do nothing
    }
    
    try {
      await deleteClaim(claimId)
      // Only update UI after successful deletion
      setClaims(claims.filter((claim) => claim.id !== claimId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete claim.")
      // Optionally reload claims to sync with backend
      const user = getUserInfo()
      if (user) {
        try {
          const data = await getStudentClaims(user.user_id)
          setClaims(
            data.map((claim) => ({
              id: claim.claim_id,
              itemName: claim.item_name,
              dateClaimed: claim.date_claimed,
              status: claim.claim_status as ClaimStatus,
            }))
          )
        } catch (reloadErr) {
          // If reload fails, keep the error message
        }
      }
    }
  }

  const getStatusBadgeColor = (status: ClaimStatus) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500 hover:bg-yellow-500 text-white"
      case "Approved":
        return "bg-green-600 hover:bg-green-600 text-white"
      case "Rejected":
        return "bg-red-600 hover:bg-red-600 text-white"
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">My Claims</CardTitle>
            <CardDescription>Track the status of your lost item claims</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>Loading your claims...</p>
              </div>
            ) : error ? (
              <div className="py-12 text-center text-destructive">
                <p>{error}</p>
              </div>
            ) : claims.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>You haven't made any claims yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left text-sm font-semibold text-foreground">Item Name</th>
                      <th className="pb-3 text-left text-sm font-semibold text-foreground">Date Claimed</th>
                      <th className="pb-3 text-left text-sm font-semibold text-foreground">Status</th>
                      <th className="pb-3 text-right text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map((claim) => (
                      <tr key={claim.id} className="border-b border-border last:border-0">
                        <td className="py-4 text-foreground">{claim.itemName}</td>
                        <td className="py-4 text-muted-foreground">
                          {new Date(claim.dateClaimed).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="py-4">
                          <Badge className={getStatusBadgeColor(claim.status)}>{claim.status}</Badge>
                        </td>
                        <td className="py-4">
                          {claim.status !== "Approved" && (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(claim.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                aria-label="Delete claim"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
