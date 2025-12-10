"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { isAuthenticated, getUserInfo } from "@/lib/api"

const claimVerificationData = {
  "1": {
    item: {
      name: "Blue Water Bottle",
      location: "Library",
      dateFound: "2024-01-15",
      image: "/blue-water-bottle.jpg",
      description: "A blue stainless steel water bottle found in the library reading area.",
      reportedBy: "Sarah Lee",
      reporterId: "21WMR11111",
    },
    claim: {
      claimantName: "Alex Johnson",
      studentId: "21WMR98765",
      phoneNumber: "+60 12-345 6789",
      proofDescription:
        "It's a blue Hydro Flask with a dent on the bottom. I bought it last month at the campus bookstore.",
    },
  },
  "2": {
    item: {
      name: "Silver Laptop",
      location: "Study Room 3",
      dateFound: "2024-01-17",
      image: "/silver-laptop.jpg",
      description: "Silver laptop found left in Study Room 3 after closing hours.",
      reportedBy: "David Lim",
      reporterId: "21WMR44444",
    },
    claim: {
      claimantName: "Rachel Wong",
      studentId: "21WMR11223",
      phoneNumber: "+60 11-234 5678",
      proofDescription:
        "MacBook Pro 13-inch, has a 'TAR UMT' sticker on the lid and my initials 'RW' engraved on the bottom.",
    },
  },
  "3": {
    item: {
      name: "Black Leather Wallet",
      location: "Gym",
      dateFound: "2024-01-14",
      image: "/black-leather-wallet.jpg",
      description: "Black leather wallet found in the gym locker room.",
      reportedBy: "Emily Wong",
      reporterId: "21WMR33333",
    },
    claim: {
      claimantName: "Tom Lee",
      studentId: "21WMR44556",
      phoneNumber: "+60 16-789 1234",
      proofDescription:
        "Black leather wallet containing my student ID card and driver's license under the name Tom Lee.",
    },
  },
}

export default function ClaimVerificationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [rationale, setRationale] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

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
  }, [router])

  const data = claimVerificationData[params.id as keyof typeof claimVerificationData]

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar role="admin" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Claim not found</p>
            <Button onClick={() => router.push("/admin")} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const { item, claim } = data

  const handleApprove = async () => {
    if (!rationale.trim()) {
      alert("Please provide a decision rationale")
      return
    }
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      alert("Claim approved successfully!")
      router.push("/admin")
    }, 1000)
  }

  const handleReject = async () => {
    if (!rationale.trim()) {
      alert("Please provide a decision rationale")
      return
    }
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      alert("Claim rejected")
      router.push("/admin")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">
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
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* Item Details */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Item Name</label>
                  <p className="mt-1 text-base font-semibold text-foreground">{item.name}</p>
                </div>

                {/* Reporter Information */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <label className="text-sm font-medium text-primary">Reporter Information</label>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Reported By:</span> {item.reportedBy}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <span className="font-medium">Student ID:</span> {item.reporterId}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location Found</label>
                    <p className="mt-1 text-sm text-foreground">{item.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date Found</label>
                    <p className="mt-1 text-sm text-foreground">
                      {new Date(item.dateFound).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">{item.description}</p>
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
                  <p className="mt-1 text-base font-semibold text-foreground">{claim.claimantName}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Student ID</label>
                    <p className="mt-1 text-sm text-foreground">{claim.studentId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <p className="mt-1 text-sm text-foreground">{claim.phoneNumber}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Proof of Ownership</label>
                  <div className="mt-2 rounded-lg bg-muted p-4">
                    <p className="text-sm leading-relaxed text-foreground">{claim.proofDescription}</p>
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
                onChange={(e) => setRationale(e.target.value)}
                placeholder="Enter your rationale here... (e.g., The proof provided matches the item description and the claimant provided verifiable details)"
                className="mt-2 min-h-[120px]"
                required
              />
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
