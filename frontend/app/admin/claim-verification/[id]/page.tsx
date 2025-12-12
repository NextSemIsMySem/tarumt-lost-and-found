"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect, use } from "react"
import Image from "next/image"
import {
  getAdminClaims,
  getItems,
  isAuthenticated,
  getUserInfo,
  processAdminClaim,
  type Item,
} from "@/lib/api"

export default function ClaimVerificationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [rationale, setRationale] = useState("")
  const [rationaleError, setRationaleError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [claim, setClaim] = useState<Awaited<ReturnType<typeof getAdminClaims>>[number] | null>(null)
  const [item, setItem] = useState<Item | null>(null)

  const { id } = use(params)
  useEffect(() => {
    // Check authentication on mount
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

    const loadData = async () => {
      try {
        const claims = await getAdminClaims()
        const found = claims.find((c) => c.claim_id === id)
        if (!found) {
          setError("Claim not found")
          return
        }
        setClaim(found)

        const items = await getItems({ item_id: found.item_id })
        setItem(items[0] ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load claim")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, router])

  const handleDecision = async (status: "Approved" | "Rejected") => {
    setRationaleError(null)
    if (!rationale.trim()) {
      setRationaleError("Decision rationale is required.")
      return
    }
    const userInfo = getUserInfo()
    if (!userInfo?.user_id) {
      setRationaleError("Missing admin ID")
      return
    }
    setIsSubmitting(true)
    try {
      await processAdminClaim({ claim_id: id, admin_id: userInfo.user_id, status, rationale: rationale.trim() })
      router.push("/admin")
    } catch (err) {
      setRationaleError(err instanceof Error ? err.message : "Failed to update claim")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCheckingAuth || loading) {
    return (
      <div className="min-h-screen bg-gradient-admin flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (error || !claim) {
    return (
      <div className="min-h-screen bg-gradient-admin">
        <Navbar role="admin" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">{error || "Claim not found"}</p>
            <Button onClick={() => router.push("/admin")} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const submittedItem = item
  const claimDate = claim.date_claimed
  const claimantName = claim.claimant_name
  const proof = claim.proof_of_ownership

  const handleApprove = async () => {
    await handleDecision("Approved")
  }

  const handleReject = async () => {
    await handleDecision("Rejected")
  }

  return (
    <div className="min-h-screen bg-gradient-admin">
      <Navbar role="admin" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-balance text-3xl font-bold text-foreground">Claim Verification</h1>
          <p className="mt-2 text-muted-foreground">Review and verify the claim details</p>
        </div>

        {/* Two Cards Side by Side */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Card 1: Reference Item */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle>Reference Item</CardTitle>
              </div>
              <Badge variant="secondary" className="mt-2 w-fit bg-blue-100 text-blue-800">
                Found Item
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Item Image */}
              {submittedItem && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={"/placeholder.svg"}
                    alt={submittedItem.item_name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              )}

              {/* Item Details */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Item Name</label>
                  <p className="mt-1 text-base font-semibold text-foreground">{submittedItem?.item_name || "—"}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location Found</label>
                    <p className="mt-1 text-sm text-foreground">{submittedItem?.location_name || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date Found</label>
                    <p className="mt-1 text-sm text-foreground">
                      {submittedItem
                        ? new Date(submittedItem.date_reported).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">
                    {submittedItem?.description || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: The Claim */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>The Claim</CardTitle>
              </div>
              <Badge variant="secondary" className="mt-2 w-fit bg-yellow-100 text-yellow-800">
                Pending Review
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Claimant Details */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Claimant Name</label>
                  <p className="mt-1 text-base font-semibold text-foreground">{claimantName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Proof of Ownership</label>
                  <div className="mt-2 rounded-lg bg-muted p-4">
                    <p className="text-sm leading-relaxed text-foreground">{proof}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date Claimed</label>
                    <p className="mt-1 text-sm text-foreground">
                      {new Date(claimDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Claim Status</label>
                    <p className="mt-1 text-sm text-foreground">{claim.claim_status}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Area */}
        <Card>
          <CardHeader>
            <CardTitle>Decision & Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Decision Rationale */}
            <div>
              <label htmlFor="rationale" className="block text-sm font-medium text-foreground">
                Decision Rationale <span className="text-destructive">*</span>
              </label>
              <p className="mt-1 text-sm text-muted-foreground">
                Provide a clear explanation for your decision to approve or reject this claim
              </p>
              <Textarea
                id="rationale"
                value={rationale}
                onChange={(e) => {
                  setRationale(e.target.value)
                  setRationaleError(null)
                }}
                placeholder="Enter your rationale here... (e.g., The proof provided matches the item description and the claimant provided verifiable details)"
                className="mt-2 min-h-[120px]"
                required
                aria-invalid={!!rationaleError}
              />
              {rationaleError && <p className="text-sm text-destructive mt-1">{rationaleError}</p>}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 sm:justify-end">
              <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting} className="sm:order-1">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isSubmitting || !rationale.trim()}
                className="bg-red-600 hover:bg-red-700 sm:order-2"
              >
                Reject Claim
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isSubmitting || !rationale.trim()}
                className="bg-green-600 hover:bg-green-700 sm:order-3"
              >
                Approve Claim
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
