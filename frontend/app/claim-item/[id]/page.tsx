"use client"

import type React from "react"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getItems, submitClaim, getUserInfo, isAuthenticated, type Item } from "@/lib/api"

export default function ClaimItemPage() {
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string

  const [item, setItem] = useState<Item | null>(null)
  const [proofOfOwnership, setProofOfOwnership] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/")
      return
    }

    const userInfo = getUserInfo()
    if (!userInfo || userInfo.role !== "student") {
      router.push("/")
      return
    }

    const loadItem = async () => {
      try {
        const items = await getItems({ item_id: itemId })
        setItem(items[0] || null)
        if (!items[0]) setError("Item not found")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load item")
      } finally {
        setLoading(false)
      }
    }

    loadItem()
  }, [itemId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!proofOfOwnership.trim() || !item) {
      alert("Please provide proof of ownership description")
      return
    }

    const userInfo = getUserInfo()
    if (!userInfo) {
      alert("You must be logged in to submit a claim.")
      return
    }

    setIsSubmitting(true)
    try {
      await submitClaim({
        item_id: item.item_id,
        student_id: userInfo.user_id,
        proof_of_ownership: proofOfOwnership,
      })
      alert("Claim submitted successfully! You will be contacted soon.")
      router.push("/")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit claim")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading item...</p>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Item not found</h1>
            <p className="mt-2 text-muted-foreground">{error || "The requested item does not exist."}</p>
            <Link href="/" className="mt-4 inline-flex items-center text-primary hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Found Items
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const userInfo = getUserInfo()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Found Items
        </Link>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader className="p-0">
              <div className="aspect-square w-full overflow-hidden rounded-t-lg bg-muted">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.item_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                    No image
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <h3 className="mb-2 text-balance text-lg font-semibold text-foreground">{item.item_name}</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Location:</span> {item.location_name}
                </p>
                <p>
                  <span className="font-medium text-foreground">Date Found:</span>{" "}
                  {new Date(item.date_reported).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p>
                  <span className="font-medium text-foreground">Category:</span> {item.category_name}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Claim Item</CardTitle>
              <CardDescription>
                Fill out the form below to claim this item. Your information will be verified.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Student Name</Label>
                    <Input
                      id="studentName"
                      value={userInfo?.username || ""}
                      readOnly
                      className="bg-muted text-muted-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input id="studentId" value={userInfo?.user_id || ""} readOnly className="bg-muted text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proofOfOwnership">
                    Description / Proof of Ownership <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="proofOfOwnership"
                    placeholder="Describe the item in detail to prove ownership (e.g., color, brand, distinguishing features, contents, purchase date, etc.)"
                    rows={6}
                    value={proofOfOwnership}
                    onChange={(e) => setProofOfOwnership(e.target.value)}
                    required
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide as much detail as possible to help us verify your claim.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 bg-transparent"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Claim"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}
