"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Clock, Eye, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  isAuthenticated,
  getUserInfo,
  getAdminStats,
  getAdminClaims,
  getItems,
  deleteItem,
  type Item,
} from "@/lib/api"

type AdminClaim = Awaited<ReturnType<typeof getAdminClaims>>[number]

export default function AdminDashboard() {
  const [items, setItems] = useState<Item[]>([])
  const [claims, setClaims] = useState<AdminClaim[]>([])
  const [stats, setStats] = useState<{ total_items: number; total_claimed: number; pending_claims: number } | null>(
    null
  )
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        const [fetchedStats, fetchedClaims, fetchedItems] = await Promise.all([
          getAdminStats(),
          getAdminClaims(),
          getItems(),
        ])

        setStats(fetchedStats)
        setClaims(fetchedClaims)
        setItems(fetchedItems)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin data")
      } finally {
        setLoadingData(false)
      }
    }

    run()
  }, [router])

  const handleViewDetails = (claim: AdminClaim) => {
    router.push(`/admin/claim-verification/${claim.claim_id}`)
  }

  const handleViewItem = (itemId: string) => {
    router.push(`/admin/item/${itemId}`)
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    try {
      await deleteItem(itemId)
      setItems((prev) => prev.filter((item) => item.item_id !== itemId))
      // Refesh stats after deletion
      const updatedStats = await getAdminStats()
      setStats(updatedStats)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete item")
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading admin data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={() => router.refresh()}>
            Retry
          </Button>
        </div>
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
          {[
            {
              title: "Total Found Items",
              value: stats ? stats.total_items.toString() : "—",
              description: "All items reported",
              icon: Package,
            },
            {
              title: "Active Found Items",
              value: stats ? (stats.total_items - stats.total_claimed).toString() : "—",
              description: "Currently available",
              icon: Package,
            },
            {
              title: "Pending Claims",
              value: stats ? stats.pending_claims.toString() : "—",
              description: "Awaiting review",
              icon: Clock,
            },
            {
              title: "Total Items Claimed",
              value: stats ? stats.total_claimed.toString() : "—",
              description: "Successfully returned",
              icon: Package,
            },
          ].map((stat, index) => {
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
                      {claims.map((claim) => (
                        <tr key={claim.claim_id} className="border-b border-border last:border-0">
                          <td className="py-4 text-sm font-medium text-foreground">{claim.item_name}</td>
                          <td className="py-4 text-sm text-foreground">{claim.claimant_name}</td>
                          <td className="py-4 text-sm text-muted-foreground">
                            {new Date(claim.date_claimed).toLocaleDateString("en-US", {
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
                  {claims.length === 0 && (
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
                        <tr key={item.item_id} className="border-b border-border last:border-0">
                          <td className="py-4 text-sm font-medium text-foreground">
                            <button
                              onClick={() => handleViewItem(item.item_id)}
                              className="text-left hover:text-primary hover:underline"
                            >
                              {item.item_name}
                            </button>
                          </td>
                          <td className="py-4 text-sm text-foreground">{item.location_name}</td>
                          <td className="py-4 text-sm text-muted-foreground">
                            {new Date(item.date_reported).toLocaleDateString("en-US", {
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
                                onClick={() => handleViewItem(item.item_id)}
                                className="gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteItem(item.item_id)}
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
