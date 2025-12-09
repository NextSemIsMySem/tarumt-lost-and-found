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
    date: "2024-03-15",
    image: "/blue-water-bottle.jpg",
  },
  {
    id: 2,
    name: "Red Backpack",
    location: "Cafeteria",
    date: "2024-03-14",
    image: "/red-backpack.png",
  },
  {
    id: 3,
    name: "Black Wallet",
    location: "Lecture Hall A",
    date: "2024-03-13",
    image: "/black-leather-wallet.jpg",
  },
  {
    id: 4,
    name: "Silver Laptop",
    location: "Computer Lab",
    date: "2024-03-12",
    image: "/silver-laptop.jpg",
  },
  {
    id: 5,
    name: "Green Umbrella",
    location: "Main Entrance",
    date: "2024-03-11",
    image: "/green-umbrella.jpg",
  },
  {
    id: 6,
    name: "White Headphones",
    location: "Sports Complex",
    date: "2024-03-10",
    image: "/white-wireless-headphones.png",
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
