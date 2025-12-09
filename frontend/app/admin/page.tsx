"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, CheckCircle, Clock, TrendingUp, Eye, Trash2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/router"

// Mock data for stats
const stats = [
  {
    title: "Total Found Items",
    value: "156",
    icon: Package,
    description: "All time found items",
  },
  {
    title: "Active Found Items",
    value: "42",
    icon: TrendingUp,
    description: "Currently available",
  },
  {
    title: "Pending Claims",
    value: "18",
    icon: Clock,
    description: "Awaiting review",
  },
  {
    title: "Total Items Claimed",
    value: "114",
    icon: CheckCircle,
    description: "Successfully returned",
  },
]

// Mock data for pending claims
const pendingClaims = [
  {
    id: 1,
    itemName: "Blue Water Bottle",
    claimantName: "Sarah Johnson",
    studentId: "2021045678",
    date: "2024-01-15",
    phoneNumber: "012-345-6789",
    proofDescription:
      "The bottle has a small dent on the bottom left side and my name 'Sarah J.' written on the cap in permanent marker. I lost it in the library on January 10th during my study session.",
  },
  {
    id: 2,
    itemName: "Black Leather Wallet",
    claimantName: "Michael Chen",
    studentId: "2022012345",
    date: "2024-01-14",
    phoneNumber: "012-987-6543",
    proofDescription:
      "The wallet contains my student ID card, a photo of my family, and a receipt from the campus bookstore dated January 12th. It's a bifold wallet with brown stitching on the edges.",
  },
  {
    id: 3,
    itemName: "Red Backpack",
    claimantName: "Emily Tan",
    studentId: "2021098765",
    date: "2024-01-13",
    phoneNumber: "016-234-5678",
    proofDescription:
      "My backpack has a keychain of a small panda attached to the zipper and contains my notebook with my name on the first page. The front pocket has a small tear near the bottom.",
  },
  {
    id: 4,
    itemName: "Silver Laptop",
    claimantName: "David Wong",
    studentId: "2023056789",
    date: "2024-01-12",
    phoneNumber: "017-876-5432",
    proofDescription:
      "The laptop is a MacBook Pro with a distinctive scratch on the top cover and has my name engraved on the bottom. The serial number is C02XY1234567.",
  },
]

// Mock data for all found items
const allFoundItems = [
  { id: 1, name: "Blue Water Bottle", location: "Library", date: "2024-01-10", status: "Active" },
  {
    id: 2,
    name: "Black Leather Wallet",
    location: "Student Center",
    date: "2024-01-12",
    status: "Active",
  },
  { id: 3, name: "Red Backpack", location: "Cafeteria", date: "2024-01-08", status: "Active" },
  { id: 4, name: "Silver Laptop", location: "Lab Room 301", date: "2024-01-11", status: "Active" },
  {
    id: 5,
    name: "Green Umbrella",
    location: "Main Entrance",
    date: "2024-01-09",
    status: "Active",
  },
  {
    id: 6,
    name: "White Wireless Headphones",
    location: "Lecture Hall B",
    date: "2024-01-13",
    status: "Active",
  },
  {
    id: 7,
    name: "Brown Textbook (Mathematics)",
    location: "Library",
    date: "2024-01-07",
    status: "Active",
  },
  { id: 8, name: "Black Phone Charger", location: "Cafeteria", date: "2024-01-14", status: "Active" },
]

export default function AdminDashboard() {
  const [selectedClaim, setSelectedClaim] = useState<(typeof pendingClaims)[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [items, setItems] = useState(allFoundItems)
  const router = useRouter()

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-balance text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage lost and found items and review claims</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
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
