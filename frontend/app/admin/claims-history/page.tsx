"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2, XCircle, Eye, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { isAuthenticated, getUserInfo, getClaimsHistory, deleteClaim, type ClaimHistory } from "@/lib/api"

export default function ClaimsHistoryPage() {
  const router = useRouter()
  const [claims, setClaims] = useState<ClaimHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const run = async () => {
      if (!isAuthenticated()) {
        router.push("/")
        return
      }

      const userInfo = getUserInfo()
      if (userInfo?.role !== "admin") {
        router.push("/")
        return
      }

      setIsCheckingAuth(false)

      try {
        const fetchedClaims = await getClaimsHistory()
        setClaims(fetchedClaims)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load claims history")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [router])

  const getStatusBadge = (status: string) => {
    if (status === "Approved") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          <XCircle className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
      )
    }
  }

  const handleViewDetails = (claimId: string) => {
    router.push(`/admin/claims-history/${claimId}`)
  }

  const handleDeleteClaim = async (claimId: string, itemName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete the claim for "${itemName}"?\n\nThis action cannot be undone.`
    )

    if (!confirmed) return

    try {
      await deleteClaim(claimId)
      setClaims((prev) => prev.filter((claim) => claim.claim_id !== claimId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete claim")
    }
  }

  if (isCheckingAuth || loading) {
    return (
      <div className="min-h-screen bg-gradient-admin flex items-center justify-center">
        <p className="text-muted-foreground">Loading claims history...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-admin">
      <Navbar role="admin" />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-balance text-3xl font-bold text-foreground">Claims History</h1>
          <p className="mt-2 text-muted-foreground">
            View all approved and rejected claims
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 pl-6 pr-4 text-left text-sm font-medium text-muted-foreground">
                      Claim ID
                    </th>
                    <th className="pb-3 px-4 text-left text-sm font-medium text-muted-foreground">
                      Item Name
                    </th>
                    <th className="pb-3 px-4 text-left text-sm font-medium text-muted-foreground">
                      Claimant Name
                    </th>
                    <th className="pb-3 px-4 text-left text-sm font-medium text-muted-foreground">
                      Date Claimed
                    </th>
                    <th className="pb-3 px-4 text-left text-sm font-medium text-muted-foreground">
                      Admin Name
                    </th>
                    <th className="pb-3 px-4 text-left text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="pb-3 pr-6 pl-4 text-right text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim.claim_id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="py-4 pl-6 pr-4 text-sm font-medium text-foreground">
                        {claim.claim_id}
                      </td>
                      <td className="py-4 px-4 text-sm text-foreground">
                        {claim.item_name}
                      </td>
                      <td className="py-4 px-4 text-sm text-foreground">
                        {claim.claimant_name}
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {new Date(claim.date_claimed).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {claim.admin_name || "—"}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(claim.claim_status)}
                      </td>
                      <td className="py-4 pr-6 pl-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {claim.claim_status === "Rejected" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClaim(claim.claim_id, claim.item_name)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              aria-label="Delete claim"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(claim.claim_id)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {claims.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No claims history found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

