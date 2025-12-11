"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trash2, MapPin, Calendar, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, use } from "react"
import Image from "next/image"
import { isAuthenticated, getUserInfo, getItems, deleteItem, type Item } from "@/lib/api"

export default function ItemViewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const run = async () => {
      // Auth guard
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
        const [fetched] = await getItems({ item_id: id })
        if (!fetched) {
          setError("Item not found")
        } else {
          setItem(fetched)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load item")
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [router, id])

  const handleDelete = async () => {
    if (!item) return
    if (!confirm(`Are you sure you want to delete "${item.item_name}"? This action cannot be undone.`)) return
    try {
      await deleteItem(item.item_id)
      router.push("/admin")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete item")
    }
  }

  const handleBack = () => {
    router.push("/admin")
  }

  if (isCheckingAuth || loading) {
    return (
      <div className="min-h-screen bg-gradient-admin flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-admin">
        <Navbar role="admin" />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">Item Not Found</h1>
          <p className="mt-2 text-muted-foreground">{error ?? "The item you are looking for does not exist."}</p>
          <Button onClick={handleBack} className="mt-6">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-admin">
      <Navbar role="admin" />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Main Card */}
        <Card className="overflow-hidden">
          {/* Item Image */}
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.item_name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <p>No image available</p>
              </div>
            )}
          </div>

          <CardContent className="p-6 sm:p-8">
            {/* Item Header */}
            <div className="mb-6">
              <h1 className="text-balance mb-3 text-3xl font-bold text-foreground">{item.item_name}</h1>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{item.category_name}</Badge>
            </div>

            {/* Item Quick Info */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location Found</p>
                  <p className="text-base text-foreground">{item.location_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date Found</p>
                  <p className="text-base text-foreground">
                    {new Date(item.date_reported).toLocaleDateString("en-US", {
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
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-base text-foreground">{item.status}</p>
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
