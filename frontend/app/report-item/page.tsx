"use client"

import type React from "react"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCategories, getLocations, submitFoundItem, getUserInfo, type Category, type Location } from "@/lib/api"

export default function ReportItemPage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    location_id: "",
    category_id: "",
    dateFound: "",
  })

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [cats, locs] = await Promise.all([getCategories(), getLocations()])
        setCategories(cats)
        setLocations(locs)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dropdown data")
      } finally {
        setLoading(false)
      }
    }
    loadDropdowns()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.itemName || !formData.description || !formData.category_id || !formData.location_id) {
      setError("Please fill in all required fields.")
      return
    }

    const user = getUserInfo()
    if (!user?.user_id) {
      setError("You must be logged in to submit a report.")
      return
    }

    try {
      setSubmitting(true)
      await submitFoundItem({
        item_name: formData.itemName,
        description: formData.description,
        category_id: formData.category_id,
        location_id: formData.location_id,
        student_id: user.user_id,
      })
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-balance text-2xl font-bold">Report a Found Item</CardTitle>
            <CardDescription className="text-pretty">
              Fill out the form below to report an item you've found on campus.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Item Name */}
              <div className="space-y-2">
                <Label htmlFor="itemName">
                  Item Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="itemName"
                  type="text"
                  placeholder="e.g., Blue Water Bottle"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  disabled={loading || submitting}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.category_id} value={category.category_id}>
                        {category.category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">
                  Location Found <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.location_id}
                  onValueChange={(value) => setFormData({ ...formData, location_id: value })}
                  disabled={loading || submitting}
                  required
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.location_id} value={location.location_id}>
                        {location.location_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Found */}
              <div className="space-y-2">
                <Label htmlFor="dateFound">
                  Date Found <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="dateFound"
                    type="date"
                    value={formData.dateFound}
                    onChange={(e) => setFormData({ ...formData, dateFound: e.target.value })}
                    className="pr-10"
                    required
                  />
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* Item Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Item Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed description including color, brand, size, condition, or any distinguishing features..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="resize-none"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Be as specific as possible to help owners identify their items.
                </p>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label htmlFor="photo">Photo Upload</Label>
                <div className="flex items-center gap-4">
                  <Input id="photo" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  <Label
                    htmlFor="photo"
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <Upload className="h-4 w-4" />
                    {selectedFile ? "Change Photo" : "Choose Photo"}
                  </Label>
                  {selectedFile && <span className="text-sm text-muted-foreground">{selectedFile.name}</span>}
                </div>
                <p className="text-sm text-muted-foreground">
                  Optional: Upload a photo of the found item to help with identification.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={submitting || loading}>
                  {submitting ? "Submitting..." : "Submit Report"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
