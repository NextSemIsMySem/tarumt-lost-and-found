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
import { useState } from "react"

const foundItems = [
  {
    id: 1,
    name: "Blue Water Bottle",
    location: "Library",
    date: "2024-01-15",
    image: "/blue-water-bottle.jpg",
    category: "Others",
    description: "A blue stainless steel water bottle found in the library reading area.",
    reportedBy: "Sarah Lee",
    reporterId: "21WMR11111",
    status: "Available",
  },
  {
    id: 2,
    name: "Red Backpack",
    location: "Cafeteria",
    date: "2024-01-16",
    image: "/red-backpack.png",
    category: "Others",
    description: "Red backpack with laptop compartment found under a cafeteria table.",
    reportedBy: "Mike Chen",
    reporterId: "21WMR22222",
    status: "Available",
  },
  {
    id: 3,
    name: "Black Leather Wallet",
    location: "Gym",
    date: "2024-01-14",
    image: "/black-leather-wallet.jpg",
    category: "Wallet",
    description: "Black leather wallet found in the gym locker room.",
    reportedBy: "Emily Wong",
    reporterId: "21WMR33333",
    status: "Available",
  },
  {
    id: 4,
    name: "Silver Laptop",
    location: "Study Room 3",
    date: "2024-01-17",
    image: "/silver-laptop.jpg",
    category: "Electronics",
    description: "Silver laptop found left in Study Room 3 after closing hours.",
    reportedBy: "David Lim",
    reporterId: "21WMR44444",
    status: "Available",
  },
  {
    id: 5,
    name: "Green Umbrella",
    location: "Main Entrance",
    date: "2024-01-13",
    image: "/green-umbrella.jpg",
    category: "Others",
    description: "Green compact umbrella found near the main entrance.",
    reportedBy: "Lisa Tan",
    reporterId: "21WMR55555",
    status: "Available",
  },
  {
    id: 6,
    name: "White Wireless Headphones",
    location: "Computer Lab",
    date: "2024-01-18",
    image: "/white-wireless-headphones.png",
    category: "Electronics",
    description: "White wireless headphones found on desk in Computer Lab 2.",
    reportedBy: "Kevin Ng",
    reporterId: "21WMR66666",
    status: "Available",
  },
]

export default function ClaimItemPage() {
  const params = useParams()
  const router = useRouter()
  const itemId = Number.parseInt(params.id as string)
  const item = foundItems.find((i) => i.id === itemId)

  const [phoneNumber, setPhoneNumber] = useState("")
  const [proofOfOwnership, setProofOfOwnership] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Item not found</h1>
            <Link href="/" className="mt-4 inline-flex items-center text-primary hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Found Items
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!proofOfOwnership.trim()) {
      alert("Please provide proof of ownership description")
      return
    }

    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    alert("Claim submitted successfully! You will be contacted soon.")
    router.push("/")
  }

  const handleCancel = () => {
    router.push("/")
  }

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
                <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <h3 className="mb-2 text-balance text-lg font-semibold text-foreground">{item.name}</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Location:</span> {item.location}
                </p>
                <p>
                  <span className="font-medium text-foreground">Date Found:</span>{" "}
                  {new Date(item.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
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
                      value="John Tan Wei Liang"
                      readOnly
                      className="bg-muted text-muted-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input id="studentId" value="21WMR12345" readOnly className="bg-muted text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="e.g., +60 12-345 6789"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proofOfOwnership">
                    Description / Proof of Ownership <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="proofOfOwnership"
                    placeholder="Please describe the item in detail to prove ownership (e.g., color, brand, distinguishing features, contents, purchase date, etc.)"
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
