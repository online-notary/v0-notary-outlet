"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, setDoc, deleteDoc, query } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/app/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, Edit, Plus, ArrowUp, ArrowDown, ImageIcon } from "lucide-react"
import Image from "next/image"
import { v4 as uuidv4 } from "uuid"

interface SliderImage {
  id: string
  title: string
  description: string
  imageUrl: string
  order: number
  isActive: boolean
}

export function SliderManager() {
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState<SliderImage | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isActive: true,
  })

  // Fetch slider images
  const fetchSliderImages = async () => {
    try {
      setLoading(true)
      const sliderCollection = collection(db, "sliderImages")
      const sliderQuery = query(sliderCollection)
      const querySnapshot = await getDocs(sliderQuery)

      const imageList: SliderImage[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<SliderImage, "id">
        imageList.push({
          id: doc.id,
          title: data.title || "",
          description: data.description || "",
          imageUrl: data.imageUrl || "",
          order: data.order || 0,
          isActive: data.isActive !== false,
        })
      })

      // Sort by order
      imageList.sort((a, b) => a.order - b.order)
      setSliderImages(imageList)
    } catch (err) {
      console.error("Error fetching slider images:", err)
      setError("Failed to load slider images")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSliderImages()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      isActive: checked,
    })
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      isActive: true,
    })
    setImageFile(null)
    setImagePreview(null)
    setCurrentImage(null)
  }

  const openAddDialog = () => {
    resetForm()
    setIsAddDialogOpen(true)
  }

  const openEditDialog = (image: SliderImage) => {
    setCurrentImage(image)
    setFormData({
      title: image.title,
      description: image.description || "",
      isActive: image.isActive,
    })
    setImagePreview(image.imageUrl)
    setIsEditDialogOpen(true)
  }

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) {
      if (currentImage?.imageUrl) {
        return currentImage.imageUrl
      }
      throw new Error("No image file selected")
    }

    const fileExtension = imageFile.name.split(".").pop()
    const fileName = `slider_${uuidv4()}.${fileExtension}`
    const storageRef = ref(storage, `slider/${fileName}`)

    await uploadBytes(storageRef, imageFile)
    const downloadUrl = await getDownloadURL(storageRef)
    return downloadUrl
  }

  const addSliderImage = async () => {
    try {
      setLoading(true)
      const imageUrl = await uploadImage()

      const newImageId = uuidv4()
      const newOrder = sliderImages.length > 0 ? Math.max(...sliderImages.map((img) => img.order)) + 1 : 0

      const newImage: SliderImage = {
        id: newImageId,
        title: formData.title,
        description: formData.description,
        imageUrl,
        order: newOrder,
        isActive: formData.isActive,
      }

      await setDoc(doc(db, "sliderImages", newImageId), newImage)

      setSliderImages([...sliderImages, newImage])
      setIsAddDialogOpen(false)
      resetForm()
    } catch (err) {
      console.error("Error adding slider image:", err)
      setError("Failed to add slider image")
    } finally {
      setLoading(false)
    }
  }

  const updateSliderImage = async () => {
    if (!currentImage) return

    try {
      setLoading(true)
      let imageUrl = currentImage.imageUrl

      if (imageFile) {
        imageUrl = await uploadImage()
      }

      const updatedImage: SliderImage = {
        ...currentImage,
        title: formData.title,
        description: formData.description,
        imageUrl,
        isActive: formData.isActive,
      }

      await setDoc(doc(db, "sliderImages", currentImage.id), updatedImage, { merge: true })

      setSliderImages(sliderImages.map((img) => (img.id === currentImage.id ? updatedImage : img)))

      setIsEditDialogOpen(false)
      resetForm()
    } catch (err) {
      console.error("Error updating slider image:", err)
      setError("Failed to update slider image")
    } finally {
      setLoading(false)
    }
  }

  const deleteSliderImage = async (id: string) => {
    try {
      setLoading(true)
      await deleteDoc(doc(db, "sliderImages", id))
      setSliderImages(sliderImages.filter((img) => img.id !== id))
    } catch (err) {
      console.error("Error deleting slider image:", err)
      setError("Failed to delete slider image")
    } finally {
      setLoading(false)
    }
  }

  const moveSliderImage = async (id: string, direction: "up" | "down") => {
    const currentIndex = sliderImages.findIndex((img) => img.id === id)
    if (currentIndex === -1) return

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

    if (newIndex < 0 || newIndex >= sliderImages.length) return

    try {
      setLoading(true)

      const currentImage = sliderImages[currentIndex]
      const targetImage = sliderImages[newIndex]

      // Swap orders
      const currentOrder = currentImage.order
      const targetOrder = targetImage.order

      await setDoc(doc(db, "sliderImages", currentImage.id), { order: targetOrder }, { merge: true })
      await setDoc(doc(db, "sliderImages", targetImage.id), { order: currentOrder }, { merge: true })

      // Update local state
      const updatedImages = [...sliderImages]
      updatedImages[currentIndex] = { ...currentImage, order: targetOrder }
      updatedImages[newIndex] = { ...targetImage, order: currentOrder }

      // Sort by order
      updatedImages.sort((a, b) => a.order - b.order)

      setSliderImages(updatedImages)
    } catch (err) {
      console.error("Error moving slider image:", err)
      setError("Failed to reorder slider images")
    } finally {
      setLoading(false)
    }
  }

  const toggleSliderImageActive = async (id: string, isActive: boolean) => {
    try {
      setLoading(true)
      await setDoc(doc(db, "sliderImages", id), { isActive }, { merge: true })

      setSliderImages(sliderImages.map((img) => (img.id === id ? { ...img, isActive } : img)))
    } catch (err) {
      console.error("Error toggling slider image active state:", err)
      setError("Failed to update slider image")
    } finally {
      setLoading(false)
    }
  }

  if (loading && sliderImages.length === 0) {
    return <div className="p-4">Loading slider images...</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hero Slider Images</CardTitle>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add Image
        </Button>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">{error}</div>}

        {sliderImages.length === 0 ? (
          <div className="text-center py-8">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No slider images</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new slider image.</p>
            <div className="mt-6">
              <Button onClick={openAddDialog}>
                <Plus className="mr-2 h-4 w-4" /> Add Image
              </Button>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sliderImages.map((image) => (
                <TableRow key={image.id}>
                  <TableCell>
                    <div className="relative w-16 h-16 rounded overflow-hidden">
                      <Image
                        src={image.imageUrl || "/placeholder.svg"}
                        alt={image.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>{image.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => moveSliderImage(image.id, "up")}
                        disabled={sliderImages.indexOf(image) === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => moveSliderImage(image.id, "down")}
                        disabled={sliderImages.indexOf(image) === sliderImages.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={image.isActive}
                      onCheckedChange={(checked) => toggleSliderImageActive(image.id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="icon" onClick={() => openEditDialog(image)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Slider Image</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this slider image? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteSliderImage(image.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Add Slider Image Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Slider Image</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="image">Image</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleFileChange} required />
                {imagePreview && (
                  <div className="relative w-full h-40 mt-2 rounded-md overflow-hidden">
                    <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="isActive" checked={formData.isActive} onCheckedChange={handleSwitchChange} />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addSliderImage} disabled={!imageFile || !formData.title}>
                Add Image
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Slider Image Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Slider Image</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-image">Image</Label>
                <Input id="edit-image" type="file" accept="image/*" onChange={handleFileChange} />
                {imagePreview && (
                  <div className="relative w-full h-40 mt-2 rounded-md overflow-hidden">
                    <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input id="edit-title" name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="edit-isActive" checked={formData.isActive} onCheckedChange={handleSwitchChange} />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updateSliderImage} disabled={!formData.title}>
                Update Image
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
