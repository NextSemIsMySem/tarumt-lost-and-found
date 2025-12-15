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
  itemId: string
  itemName: string
  itemDescription: string
  imageUrl: string
  proofOfOwnership: string
  dateClaimed: string
  status: ClaimStatus
  rationale: string | null
  adminName: string | null
  adminEmail: string | null
}

export default function MyClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
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
            itemId: claim.item_id,
            itemName: claim.item_name,
            itemDescription: claim.item_description,
            imageUrl: claim.image_url,
            proofOfOwnership: claim.proof_of_ownership,
            dateClaimed: claim.date_claimed,
            status: claim.claim_status as ClaimStatus,
            rationale: claim.rationale,
            adminName: claim.admin_name,
            adminEmail: claim.admin_email,
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
              itemId: claim.item_id,
              itemName: claim.item_name,
              itemDescription: claim.item_description,
              imageUrl: claim.image_url,
              proofOfOwnership: claim.proof_of_ownership,
              dateClaimed: claim.date_claimed,
              status: claim.claim_status as ClaimStatus,
              rationale: claim.rationale,
              adminName: claim.admin_name,
              adminEmail: claim.admin_email,
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
    <div className="min-h-screen bg-gradient-accent">
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
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedClaim(claim)}
                              className="gap-2"
                            >
                              View
                            </Button>
                            {claim.status !== "Approved" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(claim.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                aria-label="Delete claim"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
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

      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-3xl rounded-xl bg-white shadow-lg dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <p className="text-sm text-muted-foreground">
                Claimed on {
                  new Date(selectedClaim.dateClaimed).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })
                }
                </p>
                <h2 className="text-xl font-semibold text-foreground">{selectedClaim.itemName}</h2>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusBadgeColor(selectedClaim.status)}>{selectedClaim.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => setSelectedClaim(null)} aria-label="Close">
                  ✕
                </Button>
              </div>
            </div>

            <div className="grid gap-6 px-6 py-5 md:grid-cols-3">
              <div className="space-y-3">
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
                  {selectedClaim.imageUrl ? (
                    <img src={selectedClaim.imageUrl} alt={selectedClaim.itemName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image</div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Processed By</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedClaim.adminName
                      ? `${selectedClaim.adminName} (${selectedClaim.adminEmail || "no email"})`
                      : "Not processed yet"}
                  </p>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Item Description</p>
                  {selectedClaim.status === "Pending" ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mt-2 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                      <p className="text-sm font-medium">Description not yet available</p>
                      <p className="mt-2 text-sm">
                        The item description is hidden while your claim is under review. This prevents you from copying the description as proof of ownership. <br /> <br />
                        Please provide your own detailed description of the item based on your memory and knowledge to prove that it belongs to you.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {selectedClaim.itemDescription || "No description provided."}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Proof of Ownership</p>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {selectedClaim.proofOfOwnership || "No proof provided."}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Rationale</p>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {selectedClaim.status === "Pending"
                      ? "Admin is still reviewing your claim."
                      : selectedClaim.status === "Rejected"
                      ? selectedClaim.rationale || "The system automatically rejects your claim as an admin had approved another claim for this item."
                      : selectedClaim.rationale || "No rationale provided."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t px-6 py-4">
              <Button variant="outline" onClick={() => setSelectedClaim(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
