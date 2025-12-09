"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trash2, MapPin, Calendar, User } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

// Mock data for found items (matching the admin dashboard)
const foundItemsData = [
  {
    id: 1,
    name: "Blue Water Bottle",
    category: "Personal Items",
    location: "Library",
    date: "2024-01-10",
    description:
      "A blue stainless steel water bottle with a wide mouth opening. The bottle appears to be in good condition with some minor scratches on the bottom. It has a capacity of approximately 750ml and features a screw-on cap.",
    reportedBy: "John Smith (Staff ID: ST2021001)",
    image: "/blue-water-bottle.jpg",
    status: "Active",
  },
  {
    id: 2,
    name: "Black Leather Wallet",
    category: "Personal Items",
    location: "Student Center",
    date: "2024-01-12",
    description:
      "A black leather bifold wallet with brown stitching along the edges. The wallet appears well-used and contains multiple card slots. Found on a bench near the main entrance of the student center.",
    reportedBy: "Security Team (ID: SEC005)",
    image: "/black-leather-wallet.jpg",
    status: "Active",
  },
  {
    id: 3,
    name: "Red Backpack",
    category: "Bags",
    location: "Cafeteria",
    date: "2024-01-08",
    description:
      "A red canvas backpack with multiple compartments and adjustable straps. The backpack has a small front pocket with a visible tear near the bottom. There's a panda keychain attached to the main zipper.",
    reportedBy: "Cafeteria Staff (ID: CF2020015)",
    image: "/red-backpack.png",
    status: "Active",
  },
  {
    id: 4,
    name: "Silver Laptop",
    category: "Electronics",
    location: "Lab Room 301",
    date: "2024-01-11",
    description:
      "A silver MacBook Pro laptop, approximately 13-inch model. The device has a distinctive scratch on the top cover and appears to be in otherwise good condition. Found left on a desk after class hours.",
    reportedBy: "Lab Technician (ID: LT2022008)",
    image: "/silver-laptop.jpg",
    status: "Active",
  },
  {
    id: 5,
    name: "Green Umbrella",
    category: "Personal Items",
    location: "Main Entrance",
    date: "2024-01-09",
    description:
      "A green folding umbrella with a black handle. The umbrella is in working condition and appears relatively new. It was found near the main entrance during a rainy day.",
    reportedBy: "Reception Desk (ID: REC001)",
    image: "/green-umbrella.jpg",
    status: "Active",
  },
  {
    id: 6,
    name: "White Wireless Headphones",
    category: "Electronics",
    location: "Lecture Hall B",
    date: "2024-01-13",
    description:
      "White over-ear wireless headphones with noise cancellation features. The headphones are in excellent condition with minimal wear. Found on a seat in Lecture Hall B after an evening class.",
    reportedBy: "Cleaning Staff (ID: CS2021042)",
    image: "/white-wireless-headphones.png",
    status: "Active",
  },
]

export default function ItemViewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const itemId = Number.parseInt(params.id)
  const item = foundItemsData.find((i) => i.id === itemId)

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
