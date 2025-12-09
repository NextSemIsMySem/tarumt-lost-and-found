"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trash2, MapPin, Calendar, User } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

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

export default function ItemViewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const itemId = Number.parseInt(params.id)
  const item = foundItems.find((i) => i.id === itemId)

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${item?.name}"? This action cannot be undone.`)) {
      // Handle deletion logic here
      router.push("/admin")
    }
  }

  const handleBack = () => {
    router.push("/admin")
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">Item Not Found</h1>
          <p className="mt-2 text-muted-foreground">The item you are looking for does not exist.</p>
          <Button onClick={handleBack} className="mt-6">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Main Card */}
        <Card className="overflow-hidden">
          {/* Item Image */}
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            <Image
              src={item.image || "/placeholder.svg"}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          <CardContent className="p-6 sm:p-8">
            {/* Item Header */}
            <div className="mb-6">
              <h1 className="text-balance mb-3 text-3xl font-bold text-foreground">{item.name}</h1>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{item.category}</Badge>
            </div>

            {/* Item Quick Info */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location Found</p>
                  <p className="text-base text-foreground">{item.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date Found</p>
                  <p className="text-base text-foreground">
                    {new Date(item.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-semibold text-foreground">Description</h2>
              <p className="text-pretty leading-relaxed text-muted-foreground">{item.description}</p>
            </div>

            {/* Reported By Section */}
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reported By</p>
                  <p className="text-base text-foreground">{item.reportedBy}</p>
                </div>
              </div>
            </div>
          </CardContent>

          {/* Footer Actions */}
          <div className="flex flex-col justify-between gap-4 border-t border-border bg-muted/30 px-6 py-4 sm:flex-row sm:px-8">
            <Button variant="outline" onClick={handleBack} className="gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Item
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
