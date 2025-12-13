"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2, XCircle, Package, User, MapPin, Calendar, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect, use } from "react"
import { isAuthenticated, getUserInfo, getClaimsHistory, type ClaimHistory } from "@/lib/api"

export default function ClaimHistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [claim, setClaim] = useState<ClaimHistory | null>(null)
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
        const found = fetchedClaims.find((c) => c.claim_id === id)
        if (!found) {
          setError("Claim not found")
        } else {
          setClaim(found)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load claim details")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [router, id])

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

  if (isCheckingAuth || loading) {
    return (
      <div className="min-h-screen bg-gradient-admin flex items-center justify-center">
        <p className="text-muted-foreground">Loading claim details...</p>
      </div>
    )
  }

  if (error || !claim) {
    return (
      <div className="min-h-screen bg-gradient-admin">
        <Navbar role="admin" />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Claim not found</h1>
            <p className="mt-2 text-muted-foreground">{error || "The requested claim does not exist."}</p>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/claims-history")}
              className="mt-4 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Claims History
            </Button>
          </div>
        </main>
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
            onClick={() => router.push("/admin/claims-history")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Claims History
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-balance text-3xl font-bold text-foreground">{claim.item_name}</h1>
          </div>
          <p className="text-muted-foreground mb-1">
            Claim ID: {claim.claim_id}
          </p>
          <p className="text-sm text-muted-foreground">
            Claimed on{" "}
            {new Date(claim.date_claimed).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="space-y-6">
          {/* Item Details Card */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Item Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  {claim.image_url && (
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted mb-3">
                      <img
                        src={claim.image_url}
                        alt={claim.item_name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium text-foreground">Description:</span>{" "}
                    <span className="text-muted-foreground">{claim.item_description}</span>
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Category:</span>{" "}
                    <span className="text-muted-foreground">{claim.category_name}</span>
                  </p>
                  <p className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-foreground">Location:</span>{" "}
                    <span className="text-muted-foreground">{claim.location_name}</span>
                  </p>
                  <p className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-foreground">Date Found:</span>{" "}
                    <span className="text-muted-foreground">
                      {new Date(claim.date_reported).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Claimant Details Card */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Claimant Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium text-foreground">Name:</span>{" "}
                  <span className="text-muted-foreground">{claim.claimant_name}</span>
                </p>
                <p>
                  <span className="font-medium text-foreground">Student ID:</span>{" "}
                  <span className="text-muted-foreground">{claim.claimant_id}</span>
                </p>
                <p>
                  <span className="font-medium text-foreground">Email:</span>{" "}
                  <span className="text-muted-foreground">{claim.claimant_email}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Proof of Ownership & Admin Decision Card */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Proof of Ownership & Admin Decision
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Proof of Ownership */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Proof of Ownership</h3>
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {claim.proof_of_ownership}
                  </p>
                </div>
              </div>

              {/* Admin Decision */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Admin Decision
                  </h3>
                  {getStatusBadge(claim.claim_status)}
                </div>
                {claim.rationale && (
                  <div className="rounded-lg border border-border bg-muted/50 p-4 mb-3">
                    <p className="text-sm font-medium text-foreground mb-1">Rationale:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {claim.rationale}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  {claim.admin_name ? (
                    <>
                      <p className="text-sm">
                        <span className="font-medium text-foreground">Processed by:</span>{" "}
                        <span className="text-muted-foreground">
                          {claim.admin_name} ({claim.admin_id})
                        </span>
                      </p>
                      {claim.admin_email && (
                        <p className="text-sm">
                          <span className="font-medium text-foreground">Admin Email:</span>{" "}
                          <span className="text-muted-foreground">{claim.admin_email}</span>
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Admin information not available
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

