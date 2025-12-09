"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

type ClaimStatus = "Pending" | "Approved" | "Rejected"

interface Claim {
  id: string
  itemName: string
  dateClaimed: string
  status: ClaimStatus
}

export default function MyClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([
    {
      id: "1",
      itemName: "Blue Water Bottle",
      dateClaimed: "2024-01-15",
      status: "Pending",
    },
    {
      id: "2",
      itemName: "Red Backpack",
      dateClaimed: "2024-01-14",
      status: "Approved",
    },
    {
      id: "3",
      itemName: "Black Leather Wallet",
      dateClaimed: "2024-01-13",
      status: "Rejected",
    },
    {
      id: "4",
      itemName: "Silver Laptop",
      dateClaimed: "2024-01-12",
      status: "Pending",
    },
  ])

  const handleEdit = (claimId: string) => {
    console.log("[v0] Edit claim:", claimId)
    // TODO: Implement edit functionality
  }

  const handleDelete = (claimId: string) => {
    console.log("[v0] Delete claim:", claimId)
    setClaims(claims.filter((claim) => claim.id !== claimId))
  }

  const getStatusBadgeColor = (status: ClaimStatus) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500 hover:bg-yellow-500 text-white"
      case "Approved":
        return "bg-green-600 hover:bg-green-600 text-white"
      case "Rejected":
        return "bg-red-600 hover:bg-red-600 text-white"
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">My Claims</CardTitle>
            <CardDescription>Track the status of your lost item claims</CardDescription>
          </CardHeader>
          <CardContent>
            {claims.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>You haven't made any claims yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left text-sm font-semibold text-foreground">Item Name</th>
                      <th className="pb-3 text-left text-sm font-semibold text-foreground">Date Claimed</th>
                      <th className="pb-3 text-left text-sm font-semibold text-foreground">Status</th>
                      <th className="pb-3 text-right text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map((claim) => (
                      <tr key={claim.id} className="border-b border-border last:border-0">
                        <td className="py-4 text-foreground">{claim.itemName}</td>
                        <td className="py-4 text-muted-foreground">
                          {new Date(claim.dateClaimed).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="py-4">
                          <Badge className={getStatusBadgeColor(claim.status)}>{claim.status}</Badge>
                        </td>
                        <td className="py-4">
                          {claim.status !== "Approved" && (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(claim.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                aria-label="Edit claim"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(claim.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                aria-label="Delete claim"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
