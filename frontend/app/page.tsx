"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Search } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

const foundItems = [
  {
    id: 1,
    name: "Blue Water Bottle",
    location: "Library",
    date: "2024-03-15",
    image: "/blue-water-bottle.jpg",
    category: "Others",
  },
  {
    id: 2,
    name: "Red Backpack",
    location: "Cafeteria",
    date: "2024-03-14",
    image: "/red-backpack.png",
    category: "Clothing",
  },
  {
    id: 3,
    name: "Black Wallet",
    location: "Lecture Hall A",
    date: "2024-03-13",
    image: "/black-leather-wallet.jpg",
    category: "Wallet",
  },
  {
    id: 4,
    name: "Silver Laptop",
    location: "Computer Lab",
    date: "2024-03-12",
    image: "/silver-laptop.jpg",
    category: "Electronics",
  },
  {
    id: 5,
    name: "Green Umbrella",
    location: "Main Entrance",
    date: "2024-03-11",
    image: "/green-umbrella.jpg",
    category: "Others",
  },
  {
    id: 6,
    name: "White Headphones",
    location: "Sports Complex",
    date: "2024-03-10",
    image: "/white-wireless-headphones.png",
    category: "Electronics",
  },
]

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [dateSort, setDateSort] = useState("newest")

  let filteredItems = foundItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Sort by date
  filteredItems = [...filteredItems].sort((a, b) => {
    if (dateSort === "newest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    } else {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    }
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Electronics":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Clothing":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "Keys":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "Wallet":
        return "bg-green-100 text-green-700 border-green-200"
      case "Others":
        return "bg-gray-100 text-gray-700 border-gray-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-4 text-balance text-3xl font-bold text-foreground">Found Items</h1>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for items..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="All">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Keys">Keys</option>
                <option value="Wallet">Wallet</option>
                <option value="Others">Others</option>
              </select>
              <select
                value={dateSort}
                onChange={(e) => setDateSort(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <CardContent className="p-4">
                <h3 className="mb-2 text-balance text-lg font-semibold text-foreground">{item.name}</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium">Location:</span> {item.location}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="flex-1">
                      <span className="font-medium">Date Found:</span>{" "}
                      {new Date(item.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(
                        item.category,
                      )}`}
                    >
                      {item.category}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full" asChild>
                  <Link href={`/claim-item/${item.id}`}>Claim Item</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="text-pretty text-muted-foreground">
              No items found matching your search. Try different keywords.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
