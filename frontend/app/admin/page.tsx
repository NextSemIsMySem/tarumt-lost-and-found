"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Clock, Eye, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getUserInfo } from "@/lib/api"

const adminStats = [
  { title: "Total Found Items", value: "24", description: "All items reported", icon: Package },
  { title: "Active Found Items", value: "18", description: "Currently available", icon: Package },
  { title: "Pending Claims", value: "5", description: "Awaiting review", icon: Clock },
  { title: "Total Items Claimed", value: "6", description: "Successfully returned", icon: Package },
]

const pendingClaims = [
  {
    id: 1,
    itemName: "Blue Water Bottle",
    claimantName: "Alex Johnson",
    date: "2024-01-20",
    phone: "+60 12-345 6789",
    proof: "It's a blue Hydro Flask with a dent on the bottom. I bought it last month at the campus bookstore.",
  },
  {
    id: 2,
    itemName: "Silver Laptop",
    claimantName: "Rachel Wong",
    date: "2024-01-19",
    phone: "+60 11-234 5678",
    proof: "MacBook Pro 13-inch, has a 'TAR UMT' sticker on the lid and my initials 'RW' engraved on the bottom.",
  },
  {
    id: 3,
    itemName: "Black Leather Wallet",
    claimantName: "Tom Lee",
    date: "2024-01-18",
    phone: "+60 16-789 1234",
    proof: "Black leather wallet containing my student ID card and driver's license under the name Tom Lee.",
  },
]

const foundItemsData = [
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

export default function AdminDashboard() {
  const [selectedClaim, setSelectedClaim] = useState<(typeof pendingClaims)[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [items, setItems] = useState(foundItemsData)
  const router = useRouter()
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

  const handleViewDetails = (claim: (typeof pendingClaims)[0]) => {
    router.push(`/admin/claim-verification/${claim.id}`)
  }

  const handleViewItem = (itemId: number) => {
    router.push(`/admin/item/${itemId}`)
  }

  const handleDeleteItem = (itemId: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      setItems(items.filter((item) => item.id !== itemId))
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar role="admin" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-balance text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage lost and found items and review claims</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {adminStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Tabbed Tables */}
        <Card>
          <Tabs defaultValue="claims" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="claims">Claims Management</TabsTrigger>
                <TabsTrigger value="items">Items Management</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              {/* Claims Management Tab */}
              <TabsContent value="claims" className="mt-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Item Name</th>
                        <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Claimant Name</th>
                        <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Date Claimed</th>
                        <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingClaims.map((claim) => (
                        <tr key={claim.id} className="border-b border-border last:border-0">
                          <td className="py-4 text-sm font-medium text-foreground">{claim.itemName}</td>
                          <td className="py-4 text-sm text-foreground">{claim.claimantName}</td>
                          <td className="py-4 text-sm text-muted-foreground">
                            {new Date(claim.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="py-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(claim)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {pendingClaims.length === 0 && (
                    <div className="py-12 text-center">
                      <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-sm text-muted-foreground">No pending claims</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Items Management Tab */}
              <TabsContent value="items" className="mt-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Item Name</th>
                        <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Location Found</th>
                        <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Date Found</th>
                        <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                        <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-b border-border last:border-0">
                          <td className="py-4 text-sm font-medium text-foreground">
                            <button
                              onClick={() => handleViewItem(item.id)}
                              className="text-left hover:text-primary hover:underline"
                            >
                              {item.name}
                            </button>
                          </td>
                          <td className="py-4 text-sm text-foreground">{item.location}</td>
                          <td className="py-4 text-sm text-muted-foreground">
                            {new Date(item.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="py-4">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {item.status}
                            </Badge>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewItem(item.id)}
                                className="gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteItem(item.id)}
                                className="gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {items.length === 0 && (
                    <div className="py-12 text-center">
                      <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-sm text-muted-foreground">No items found</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Claim Details Modal */}
        {/* Removed modal code as navigation is now handled by router */}
      </div>
    </div>
  )
}
