"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getUserInfo, getItems, getCategories, getLocations, isAuthenticated, type Item, type Category, type Location } from "@/lib/api"

const Home = () => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [locationFilter, setLocationFilter] = useState("All")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication on mount
    if (!isAuthenticated()) {
      router.push("/")
      return
    }

    const userInfo = getUserInfo()
    if (userInfo?.role !== "student") {
      router.push("/")
      return
    }

    const loadData = async () => {
      try {
        const [fetchedCategories, fetchedItems, fetchedLocations] = await Promise.all([
          getCategories(),
          getItems(),
          getLocations(),
        ])
        setCategories(fetchedCategories)
        setItems(fetchedItems)
        setLocations(fetchedLocations)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setIsCheckingAuth(false)
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchQuery.toLowerCase()
    const filtered = items.filter((item) => {
      const matchesSearch =
        item.item_name.toLowerCase().includes(normalizedSearch) ||
        item.location_name.toLowerCase().includes(normalizedSearch) ||
        item.description.toLowerCase().includes(normalizedSearch)
      const matchesCategory = categoryFilter === "All" || item.category_name === categoryFilter
      const matchesLocation = locationFilter === "All" || item.location_name === locationFilter
      return matchesSearch && matchesCategory && matchesLocation
    })

    // Sort by date (newest first) by default
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date_reported).getTime()
      const dateB = new Date(b.date_reported).getTime()
      return dateB - dateA
    })
  }, [items, searchQuery, categoryFilter, locationFilter])

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

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
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_name}>
                    {category.category_name}
                  </option>
                ))}
              </select>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="All">All Locations</option>
                {locations.map((location) => (
                  <option key={location.location_id} value={location.location_name}>
                    {location.location_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="text-pretty text-muted-foreground">Loading items...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-12 text-center text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item.item_id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img src={"/placeholder.svg"} alt={item.item_name} className="h-full w-full object-cover" />
              </div>
              <CardContent className="p-4">
                <h3 className="mb-2 text-balance text-lg font-semibold text-foreground">{item.item_name}</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium">Location:</span> {item.location_name}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="flex-1">
                      <span className="font-medium">Date Found:</span>{" "}
                      {new Date(item.date_reported).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(
                        item.category_name,
                      )}`}
                    >
                      {item.category_name}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full" asChild>
                  <Link href={`/claim-item/${item.item_id}`}>Claim Item</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {!loading && !error && filteredItems.length === 0 && (
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

export default Home
