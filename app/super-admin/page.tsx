"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { db } from "@/app/lib/firebase"
import {
  collection,
  getDocs,
  query,
  limit,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  orderBy as firestoreOrderBy,
} from "firebase/firestore"
import { getAuth, onAuthStateChanged, getIdToken } from "firebase/auth"
import { Loader2, Info, ExternalLink, Plus, Trash2, Upload, X, ImageIcon, PencilIcon } from "lucide-react"
import Image from "next/image"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SliderManager } from "./components/slider-manager"

interface Notary {
  id: string
  name: string
  email: string
  state: string
  licenseNumber: string
  commissionNumber?: string
  commissionExpiration?: string
  isVerified: boolean
  isActive: boolean
  createdAt: number
  updatedAt: number
  profileImageUrl?: string
  userId?: string
}

interface UserCredentials {
  email: string
  password: string
  isExisting: boolean
  userId: string
}

interface SliderImage {
  id: string
  imageUrl: string
  title: string
  order: number
  isActive: boolean
  createdAt: number
  updatedAt: number
}

// Initial form state for adding a new notary
const initialNotaryForm = {
  name: "",
  email: "",
  state: "",
  licenseNumber: "",
  commissionNumber: "",
  commissionExpiration: "",
  isVerified: false,
  isActive: true, // Active by default (controls visibility)
  bio: "",
}

// Initial form state for adding a new slider image
const initialSliderForm = {
  title: "",
  order: 0,
  isActive: true,
}

// List of US states for the dropdown
const usStates = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
]

export default function SuperAdminPage() {
  const router = useRouter()
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSlider, setLoadingSlider] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isAddingNotary, setIsAddingNotary] = useState(false)
  const [isAddingSlider, setIsAddingSlider] = useState(false)
  const [notaryForm, setNotaryForm] = useState(initialNotaryForm)
  const [sliderForm, setSliderForm] = useState(initialSliderForm)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addSliderDialogOpen, setAddSliderDialogOpen] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [sliderImage, setSliderImage] = useState<File | null>(null)
  const [sliderImagePreview, setSliderImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sliderFileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)
  const editSliderFileInputRef = useRef<HTMLInputElement>(null)
  const [editPhotoDialogOpen, setEditPhotoDialogOpen] = useState(false)
  const [editSliderDialogOpen, setEditSliderDialogOpen] = useState(false)
  const [editingNotary, setEditingNotary] = useState<Notary | null>(null)
  const [editingSlider, setEditingSlider] = useState<SliderImage | null>(null)
  const [editProfileImage, setEditProfileImage] = useState<File | null>(null)
  const [editSliderImage, setEditSliderImage] = useState<File | null>(null)
  const [editProfileImagePreview, setEditProfileImagePreview] = useState<string | null>(null)
  const [editSliderImagePreview, setEditSliderImagePreview] = useState<string | null>(null)
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false)
  const [isUpdatingSlider, setIsUpdatingSlider] = useState(false)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [userCredentials, setUserCredentials] = useState<UserCredentials | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("notaries")

  // Check if user is admin (amy@mediadrops.net) and get auth token
  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isAdminUser = user.email?.toLowerCase() === "amy@mediadrops.net"
        setIsAdmin(isAdminUser)

        if (isAdminUser) {
          try {
            const token = await getIdToken(user)
            setAuthToken(token)
          } catch (error) {
            console.error("Error getting auth token:", error)
          }
        }
      } else {
        setIsAdmin(false)
        setAuthToken(null)
      }
      setIsCheckingAuth(false)
    })

    return () => unsubscribe()
  }, [])

  // Fetch notaries from Firestore
  useEffect(() => {
    async function fetchNotaries() {
      try {
        setLoading(true)
        const notariesCollection = collection(db, "notaries")
        const notariesQuery = query(notariesCollection, limit(100))
        const querySnapshot = await getDocs(notariesQuery)

        const notaryList: Notary[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Notary, "id">
          notaryList.push({
            id: doc.id,
            name: data.name || "Unknown",
            email: data.email || "No email",
            state: data.state || "Unknown",
            licenseNumber: data.licenseNumber || "Not provided",
            commissionNumber: data.commissionNumber || "Not provided",
            commissionExpiration: data.commissionExpiration || "Not provided",
            isVerified: data.isVerified || false,
            isActive: data.isActive !== false, // Default to true if not set
            createdAt: data.createdAt || Date.now(),
            updatedAt: Date.now(),
            profileImageUrl: data.profileImageUrl || undefined,
            userId: data.userId || undefined,
          })
        })

        // Sort by creation date (newest first)
        notaryList.sort((a, b) => b.createdAt - a.createdAt)
        setNotaries(notaryList)
      } catch (error) {
        console.error("Error fetching notaries:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isAdmin && authToken) {
      fetchNotaries()
    }
  }, [isAdmin, authToken])

  // Fetch slider images from Firestore
  useEffect(() => {
    async function fetchSliderImages() {
      try {
        setLoadingSlider(true)
        const sliderCollection = collection(db, "sliderImages")
        const sliderQuery = query(sliderCollection, firestoreOrderBy("order", "asc"))
        const querySnapshot = await getDocs(sliderQuery)

        const imageList: SliderImage[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          imageList.push({
            id: doc.id,
            imageUrl: data.imageUrl || "",
            title: data.title || "",
            order: data.order || 0,
            isActive: data.isActive !== false, // Default to true if not set
            createdAt: data.createdAt || Date.now(),
            updatedAt: data.updatedAt || Date.now(),
          })
        })

        setSliderImages(imageList)
      } catch (error) {
        console.error("Error fetching slider images:", error)
      } finally {
        setLoadingSlider(false)
      }
    }

    if (isAdmin && authToken && activeTab === "slider") {
      fetchSliderImages()
    }
  }, [isAdmin, authToken, activeTab])

  // Toggle verification status
  const toggleVerification = async (notary: Notary) => {
    try {
      setUpdatingId(notary.id)
      const newStatus = !notary.isVerified

      // Update in Firestore
      const notaryRef = doc(db, "notaries", notary.id)
      await updateDoc(notaryRef, {
        isVerified: newStatus,
        updatedAt: Date.now(),
      })

      // Update local state
      setNotaries(
        notaries.map((n) => (n.id === notary.id ? { ...n, isVerified: newStatus, updatedAt: Date.now() } : n)),
      )

      toast({
        title: `Notary ${newStatus ? "Verified" : "Unverified"}`,
        description: `${notary.name} has been ${newStatus ? "verified" : "unverified"} successfully.`,
        variant: newStatus ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error updating verification status:", error)
      toast({
        title: "Update Failed",
        description: "There was an error updating the verification status.",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  // Direct toggle active status (visibility) without confirmation
  const toggleActiveStatus = async (notaryId: string, currentStatus: boolean) => {
    try {
      setUpdatingId(notaryId)
      const newStatus = !currentStatus

      // Get the notary
      const notary = notaries.find((n) => n.id === notaryId)
      if (!notary) {
        throw new Error("Notary not found")
      }

      console.log(`Toggling visibility for ${notary.name} from ${currentStatus} to ${newStatus}`)

      // Update in Firestore
      const notaryRef = doc(db, "notaries", notaryId)
      await updateDoc(notaryRef, {
        isActive: newStatus,
        updatedAt: Date.now(),
      })

      // Update local state
      setNotaries(notaries.map((n) => (n.id === notaryId ? { ...n, isActive: newStatus, updatedAt: Date.now() } : n)))

      toast({
        title: `Visibility ${newStatus ? "Enabled" : "Disabled"}`,
        description: `${notary.name} is now ${newStatus ? "visible" : "hidden"} in the public directory.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating active status:", error)
      toast({
        title: "Update Failed",
        description: "There was an error updating the visibility status.",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  // Toggle slider image active status
  const toggleSliderActive = async (sliderId: string, currentStatus: boolean) => {
    try {
      setUpdatingId(sliderId)
      const newStatus = !currentStatus

      // Get the slider
      const slider = sliderImages.find((s) => s.id === sliderId)
      if (!slider) {
        throw new Error("Slider image not found")
      }

      // Update in Firestore
      const sliderRef = doc(db, "sliderImages", sliderId)
      await updateDoc(sliderRef, {
        isActive: newStatus,
        updatedAt: Date.now(),
      })

      // Update local state
      setSliderImages(
        sliderImages.map((s) => (s.id === sliderId ? { ...s, isActive: newStatus, updatedAt: Date.now() } : s)),
      )

      toast({
        title: `Slider Image ${newStatus ? "Activated" : "Deactivated"}`,
        description: `"${slider.title}" is now ${newStatus ? "visible" : "hidden"} in the slider.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating slider active status:", error)
      toast({
        title: "Update Failed",
        description: "There was an error updating the slider visibility.",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  // Move slider image up or down in order
  const moveSliderImage = async (sliderId: string, direction: "up" | "down") => {
    try {
      setUpdatingId(sliderId)

      // Find current slider and its index
      const currentIndex = sliderImages.findIndex((s) => s.id === sliderId)
      if (currentIndex === -1) {
        throw new Error("Slider image not found")
      }

      // Calculate target index
      const targetIndex =
        direction === "up" ? Math.max(0, currentIndex - 1) : Math.min(sliderImages.length - 1, currentIndex + 1)

      // If already at the limit, do nothing
      if (targetIndex === currentIndex) {
        setUpdatingId(null)
        return
      }

      // Get the slider at the target position
      const targetSlider = sliderImages[targetIndex]
      const currentSlider = sliderImages[currentIndex]

      // Swap orders
      const currentOrder = currentSlider.order
      const targetOrder = targetSlider.order

      // Update in Firestore
      const currentRef = doc(db, "sliderImages", currentSlider.id)
      const targetRef = doc(db, "sliderImages", targetSlider.id)

      await updateDoc(currentRef, {
        order: targetOrder,
        updatedAt: Date.now(),
      })

      await updateDoc(targetRef, {
        order: currentOrder,
        updatedAt: Date.now(),
      })

      // Update local state
      const updatedSliders = [...sliderImages]
      updatedSliders[currentIndex] = { ...currentSlider, order: targetOrder }
      updatedSliders[targetIndex] = { ...targetSlider, order: currentOrder }

      // Sort by order
      updatedSliders.sort((a, b) => a.order - b.order)
      setSliderImages(updatedSliders)

      toast({
        title: "Order Updated",
        description: `Slider image order has been updated.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating slider order:", error)
      toast({
        title: "Update Failed",
        description: "There was an error updating the slider order.",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  // Delete notary
  const deleteNotary = async (notary: Notary) => {
    try {
      setDeletingId(notary.id)

      // Delete from Firestore
      const notaryRef = doc(db, "notaries", notary.id)
      await deleteDoc(notaryRef)

      // Update local state
      setNotaries(notaries.filter((n) => n.id !== notary.id))

      toast({
        title: "Notary Deleted",
        description: `${notary.name} has been permanently deleted.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error deleting notary:", error)
      toast({
        title: "Delete Failed",
        description: "There was an error deleting the notary.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  // Delete slider image
  const deleteSliderImage = async (slider: SliderImage) => {
    try {
      setDeletingId(slider.id)

      // Delete from Firestore
      const sliderRef = doc(db, "sliderImages", slider.id)
      await deleteDoc(sliderRef)

      // Update local state
      setSliderImages(sliderImages.filter((s) => s.id !== slider.id))

      toast({
        title: "Slider Image Deleted",
        description: `"${slider.title}" has been permanently deleted.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error deleting slider image:", error)
      toast({
        title: "Delete Failed",
        description: "There was an error deleting the slider image.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  // Create user account for notary
  const createUserAccount = async (
    email: string,
    name: string,
  ): Promise<{ userId: string; password?: string; isExisting: boolean }> => {
    if (!authToken) {
      throw new Error("Not authenticated as admin")
    }

    try {
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ email, name }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create user account")
      }

      const data = await response.json()

      return {
        userId: data.user.uid,
        password: data.password,
        isExisting: data.isExisting,
      }
    } catch (error) {
      console.error("Error creating user account:", error)
      throw error
    }
  }

  // Upload image to Firebase Storage
  const uploadImageToStorage = async (file: File, notaryId: string): Promise<string> => {
    if (!authToken) {
      throw new Error("Not authenticated as admin")
    }

    try {
      setIsUploadingImage(true)

      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("file", file)
      formData.append("notaryId", notaryId)

      // Use the API route to upload the image
      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to upload image")
      }

      const data = await response.json()
      return data.imageUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      throw error
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Upload slider image to Firebase Storage
  const uploadSliderImageToStorage = async (file: File, sliderId: string): Promise<string> => {
    if (!authToken) {
      throw new Error("Not authenticated as admin")
    }

    try {
      setIsUploadingImage(true)

      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("file", file)
      formData.append("sliderId", sliderId) // Use sliderId instead of notaryId
      formData.append("folder", "slider") // Specify folder for slider images

      // Use the API route to upload the image
      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to upload image")
      }

      const data = await response.json()
      return data.imageUrl
    } catch (error) {
      console.error("Error uploading slider image:", error)
      throw error
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Handle image selection for new notary
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setProfileImage(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Handle image selection for new slider
  const handleSliderImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setSliderImage(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setSliderImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Handle image selection for edit photo
  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setEditProfileImage(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setEditProfileImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Handle image selection for edit slider
  const handleEditSliderImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setEditSliderImage(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setEditSliderImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Clear selected image for new notary
  const clearSelectedImage = () => {
    setProfileImage(null)
    setProfileImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Clear selected image for new slider
  const clearSelectedSliderImage = () => {
    setSliderImage(null)
    setSliderImagePreview(null)
    if (sliderFileInputRef.current) {
      sliderFileInputRef.current.value = ""
    }
  }

  // Clear selected image for edit photo
  const clearEditSelectedImage = () => {
    setEditProfileImage(null)
    setEditProfileImagePreview(null)
    if (editFileInputRef.current) {
      editFileInputRef.current.value = ""
    }
  }

  // Clear selected image for edit slider
  const clearEditSelectedSliderImage = () => {
    setEditSliderImage(null)
    setEditSliderImagePreview(null)
    if (editSliderFileInputRef.current) {
      editSliderFileInputRef.current.value = ""
    }
  }

  // Open edit photo dialog
  const openEditPhotoDialog = (notary: Notary) => {
    setEditingNotary(notary)
    setEditProfileImage(null)
    setEditProfileImagePreview(notary.profileImageUrl || null)
    setEditPhotoDialogOpen(true)
  }

  // Open edit slider dialog
  const openEditSliderDialog = (slider: SliderImage) => {
    setEditingSlider(slider)
    setEditSliderImage(null)
    setEditSliderImagePreview(slider.imageUrl || null)
    setEditSliderDialogOpen(true)
  }

  // Update notary photo
  const updateNotaryPhoto = async () => {
    if (!editingNotary) return

    try {
      setIsUpdatingPhoto(true)

      let newImageUrl = editingNotary.profileImageUrl

      if (editProfileImage) {
        try {
          // Upload the image to Firebase Storage
          newImageUrl = await uploadImageToStorage(editProfileImage, editingNotary.id)
        } catch (error: any) {
          toast({
            title: "Image Upload Failed",
            description: error.message || "There was an error uploading the image.",
            variant: "destructive",
          })
          return
        }
      }

      // Update in Firestore
      const notaryRef = doc(db, "notaries", editingNotary.id)
      await updateDoc(notaryRef, {
        profileImageUrl: newImageUrl,
        updatedAt: Date.now(),
      })

      // Update local state
      setNotaries(
        notaries.map((n) =>
          n.id === editingNotary.id ? { ...n, profileImageUrl: newImageUrl, updatedAt: Date.now() } : n,
        ),
      )

      toast({
        title: "Photo Updated",
        description: `${editingNotary.name}'s profile photo has been updated.`,
        variant: "default",
      })

      // Close dialog and reset state
      setEditPhotoDialogOpen(false)
      setEditingNotary(null)
      setEditProfileImage(null)
      setEditProfileImagePreview(null)
    } catch (error) {
      console.error("Error updating photo:", error)
      toast({
        title: "Update Failed",
        description: "There was an error updating the profile photo.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPhoto(false)
    }
  }

  // Update slider image
  const updateSliderImage = async () => {
    if (!editingSlider) return

    try {
      setIsUpdatingSlider(true)

      // Create updated slider object
      const updatedSlider = {
        ...editingSlider,
        title: (document.getElementById("edit-slider-title") as HTMLInputElement)?.value || editingSlider.title,
        updatedAt: Date.now(),
      }

      let newImageUrl = editingSlider.imageUrl

      if (editSliderImage) {
        try {
          // Upload the image to Firebase Storage
          newImageUrl = await uploadSliderImageToStorage(editSliderImage, editingSlider.id)
          updatedSlider.imageUrl = newImageUrl
        } catch (error: any) {
          toast({
            title: "Image Upload Failed",
            description: error.message || "There was an error uploading the image.",
            variant: "destructive",
          })
          return
        }
      }

      // Update in Firestore
      const sliderRef = doc(db, "sliderImages", editingSlider.id)
      await updateDoc(sliderRef, updatedSlider)

      // Update local state
      setSliderImages(sliderImages.map((s) => (s.id === editingSlider.id ? updatedSlider : s)))

      toast({
        title: "Slider Updated",
        description: `Slider image "${updatedSlider.title}" has been updated.`,
        variant: "default",
      })

      // Close dialog and reset state
      setEditSliderDialogOpen(false)
      setEditingSlider(null)
      setEditSliderImage(null)
      setEditSliderImagePreview(null)
    } catch (error) {
      console.error("Error updating slider:", error)
      toast({
        title: "Update Failed",
        description: "There was an error updating the slider image.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingSlider(false)
    }
  }

  // Add new notary
  const addNotary = async () => {
    try {
      setIsAddingNotary(true)

      // Validate form
      if (!notaryForm.name || !notaryForm.email || !notaryForm.state || !notaryForm.licenseNumber) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        return
      }

      // Create user account first
      let userAccount
      try {
        userAccount = await createUserAccount(notaryForm.email, notaryForm.name)
      } catch (error: any) {
        toast({
          title: "User Account Creation Failed",
          description: error.message || "There was an error creating the user account.",
          variant: "destructive",
        })
        return
      }

      // Add to Firestore
      const notariesCollection = collection(db, "notaries")
      const timestamp = Date.now()

      const newNotary = {
        ...notaryForm,
        userId: userAccount.userId,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      const docRef = await addDoc(notariesCollection, newNotary)

      // Upload image if one is selected
      let profileImageUrl = undefined
      if (profileImage) {
        try {
          // Upload the image to Firebase Storage
          profileImageUrl = await uploadImageToStorage(profileImage, docRef.id)

          // Update the notary record with the image URL
          await updateDoc(doc(db, "notaries", docRef.id), {
            profileImageUrl,
            updatedAt: Date.now(),
          })
        } catch (error: any) {
          toast({
            title: "Image Upload Failed",
            description: error.message || "The notary was added but we couldn't upload the profile image.",
            variant: "destructive",
          })
        }
      }

      // Add to local state
      const addedNotary: Notary = {
        id: docRef.id,
        ...newNotary,
        profileImageUrl,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      setNotaries([addedNotary, ...notaries])

      // Show credentials if a new account was created
      if (!userAccount.isExisting && userAccount.password) {
        setUserCredentials({
          email: notaryForm.email,
          password: userAccount.password,
          isExisting: userAccount.isExisting,
          userId: userAccount.userId,
        })
        setCredentialsDialogOpen(true)
      } else {
        toast({
          title: "Notary Added",
          description: `${notaryForm.name} has been added successfully. User account already existed.`,
          variant: "default",
        })
      }

      // Reset form and close dialog
      setNotaryForm(initialNotaryForm)
      setProfileImage(null)
      setProfileImagePreview(null)
      setAddDialogOpen(false)
    } catch (error) {
      console.error("Error adding notary:", error)
      toast({
        title: "Add Failed",
        description: "There was an error adding the notary.",
        variant: "destructive",
      })
    } finally {
      setIsAddingNotary(false)
    }
  }

  // Add new slider image
  const addSliderImage = async () => {
    try {
      setIsAddingSlider(true)

      // Validate form
      if (!sliderForm.title || !sliderImage) {
        toast({
          title: "Missing Information",
          description: "Please provide a title and select an image.",
          variant: "destructive",
        })
        return
      }

      // Determine the next order number
      let nextOrder = 1
      if (sliderImages.length > 0) {
        nextOrder = Math.max(...sliderImages.map((s) => s.order)) + 1
      }

      // Add to Firestore
      const sliderCollection = collection(db, "sliderImages")
      const timestamp = Date.now()

      const newSlider = {
        ...sliderForm,
        order: nextOrder,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      const docRef = await addDoc(sliderCollection, newSlider)

      // Upload image
      let imageUrl = ""
      try {
        // Upload the image to Firebase Storage
        imageUrl = await uploadSliderImageToStorage(sliderImage, docRef.id)

        // Update the slider record with the image URL
        await updateDoc(doc(db, "sliderImages", docRef.id), {
          imageUrl,
          updatedAt: Date.now(),
        })
      } catch (error: any) {
        toast({
          title: "Image Upload Failed",
          description: error.message || "The slider was added but we couldn't upload the image.",
          variant: "destructive",
        })

        // Delete the slider document if image upload fails
        await deleteDoc(doc(db, "sliderImages", docRef.id))
        throw new Error("Image upload failed")
      }

      // Add to local state
      const addedSlider: SliderImage = {
        id: docRef.id,
        ...newSlider,
        imageUrl,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      setSliderImages([...sliderImages, addedSlider].sort((a, b) => a.order - b.order))

      toast({
        title: "Slider Image Added",
        description: `"${sliderForm.title}" has been added to the slider.`,
        variant: "default",
      })

      // Reset form and close dialog
      setSliderForm(initialSliderForm)
      setSliderImage(null)
      setSliderImagePreview(null)
      setAddSliderDialogOpen(false)
    } catch (error) {
      console.error("Error adding slider image:", error)
      toast({
        title: "Add Failed",
        description: "There was an error adding the slider image.",
        variant: "destructive",
      })
    } finally {
      setIsAddingSlider(false)
    }
  }

  // Copy credentials to clipboard
  const copyCredentials = () => {
    if (!userCredentials) return

    const text = `Email: ${userCredentials.email}\nPassword: ${userCredentials.password}`
    navigator.clipboard.writeText(text)

    toast({
      title: "Copied to Clipboard",
      description: "Login credentials have been copied to your clipboard.",
      variant: "default",
    })
  }

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNotaryForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle slider form input changes
  const handleSliderFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSliderForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setNotaryForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setNotaryForm((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  // Handle slider checkbox changes
  const handleSliderCheckboxChange = (name: string, checked: boolean) => {
    setSliderForm((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  // Filter notaries based on search term
  const filteredNotaries = notaries.filter(
    (notary) =>
      notary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notary.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notary.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notary.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notary.commissionNumber && notary.commissionNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (notary.commissionExpiration && notary.commissionExpiration.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format expiration date
  const formatExpiration = (dateString: string | undefined) => {
    if (!dateString) return "Not provided"

    // Check if it's a timestamp
    if (!isNaN(Number(dateString))) {
      return new Date(Number(dateString)).toLocaleDateString()
    }

    // Try to parse as date string
    try {
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString()
      }
    } catch (e) {
      // If parsing fails, return as is
    }

    return dateString
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This page is only accessible to administrators with the email address: amy@mediadrops.net
              </p>
              <Button onClick={() => router.push("/")}>Return to Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Super Admin Dashboard</h1>

      <Tabs defaultValue="notaries">
        <TabsList className="mb-4">
          <TabsTrigger value="notaries">Notaries</TabsTrigger>
          <TabsTrigger value="slider">Hero Slider</TabsTrigger>
        </TabsList>

        <TabsContent value="notaries">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <CardTitle>Notary List</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Info className="h-4 w-4" />
                      Toggle active status to control visibility in the public directory
                    </span>
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-2 mt-2 md:mt-0">
                  <Input
                    type="search"
                    placeholder="Search notaries..."
                    className="max-w-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Dialog
                    open={addDialogOpen}
                    onOpenChange={(open) => {
                      setAddDialogOpen(open)
                      if (!open) {
                        // Reset form when dialog is closed
                        setNotaryForm(initialNotaryForm)
                        setProfileImage(null)
                        setProfileImagePreview(null)
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-1">
                        <Plus className="h-4 w-4" />
                        Add Notary
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Notary</DialogTitle>
                        <DialogDescription>
                          Enter the details for the new notary. Fields marked with * are required.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {/* Profile Image Upload */}
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label className="text-right">Profile Image</Label>
                          <div className="col-span-3">
                            {profileImagePreview ? (
                              <div className="relative">
                                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200">
                                  <Image
                                    src={profileImagePreview || "/placeholder.svg"}
                                    alt="Profile preview"
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={clearSelectedImage}
                                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/4 -translate-y-1/4"
                                  aria-label="Remove image"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                                <p className="text-xs text-gray-500 mt-1">
                                  {profileImage?.name} ({Math.round(profileImage?.size / 1024)} KB)
                                </p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300">
                                  <ImageIcon className="h-8 w-8 text-gray-400" />
                                </div>
                                <div className="mt-2">
                                  <input
                                    ref={fileInputRef}
                                    type="file"
                                    id="profileImage"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-1"
                                  >
                                    <Upload className="h-3 w-3" />
                                    Select Image
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name *
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={notaryForm.name}
                            onChange={handleFormChange}
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right">
                            Email *
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={notaryForm.email}
                            onChange={handleFormChange}
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="state" className="text-right">
                            State *
                          </Label>
                          <Select
                            value={notaryForm.state}
                            onValueChange={(value) => handleSelectChange("state", value)}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select a state" />
                            </SelectTrigger>
                            <SelectContent>
                              {usStates.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="licenseNumber" className="text-right">
                            License # *
                          </Label>
                          <Input
                            id="licenseNumber"
                            name="licenseNumber"
                            value={notaryForm.licenseNumber}
                            onChange={handleFormChange}
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="commissionNumber" className="text-right">
                            Commission #
                          </Label>
                          <Input
                            id="commissionNumber"
                            name="commissionNumber"
                            value={notaryForm.commissionNumber}
                            onChange={handleFormChange}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="commissionExpiration" className="text-right">
                            Expires
                          </Label>
                          <Input
                            id="commissionExpiration"
                            name="commissionExpiration"
                            type="date"
                            value={notaryForm.commissionExpiration}
                            onChange={handleFormChange}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="bio" className="text-right">
                            Bio
                          </Label>
                          <Textarea
                            id="bio"
                            name="bio"
                            value={notaryForm.bio}
                            onChange={handleFormChange}
                            className="col-span-3"
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label className="text-right">Status</Label>
                          <div className="flex flex-col gap-2 col-span-3">
                            <div className="flex items-center gap-2">
                              <Switch
                                id="isVerified"
                                checked={notaryForm.isVerified}
                                onCheckedChange={(checked) => handleCheckboxChange("isVerified", checked)}
                              />
                              <Label htmlFor="isVerified" className="cursor-pointer">
                                Verified
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                id="isActive"
                                checked={notaryForm.isActive}
                                onCheckedChange={(checked) => handleCheckboxChange("isActive", checked)}
                              />
                              <Label htmlFor="isActive" className="cursor-pointer">
                                Active (visible in public directory)
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={addNotary}
                          disabled={
                            isAddingNotary ||
                            isUploadingImage ||
                            !notaryForm.name ||
                            !notaryForm.email ||
                            !notaryForm.state ||
                            !notaryForm.licenseNumber
                          }
                        >
                          {isAddingNotary || isUploadingImage ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {isUploadingImage ? "Processing..." : "Adding..."}
                            </>
                          ) : (
                            "Add Notary"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : notaries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No notaries found in the database.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Photo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>License</TableHead>
                        <TableHead>Commission #</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>Visibility</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNotaries.map((notary) => (
                        <TableRow key={notary.id}>
                          <TableCell>
                            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100 group">
                              {notary.profileImageUrl ? (
                                <>
                                  <Image
                                    src={notary.profileImageUrl || "/placeholder.svg"}
                                    alt={`${notary.name}'s profile`}
                                    fill
                                    className="object-cover"
                                  />
                                  <button
                                    onClick={() => openEditPhotoDialog(notary)}
                                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Edit photo"
                                  >
                                    <PencilIcon className="h-4 w-4 text-white" />
                                  </button>
                                </>
                              ) : (
                                <div
                                  className="flex items-center justify-center h-full w-full text-gray-400 cursor-pointer"
                                  onClick={() => openEditPhotoDialog(notary)}
                                  title="Add photo"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{notary.name}</TableCell>
                          <TableCell>{notary.email}</TableCell>
                          <TableCell>{notary.state}</TableCell>
                          <TableCell>{notary.licenseNumber}</TableCell>
                          <TableCell>{notary.commissionNumber || "N/A"}</TableCell>
                          <TableCell>{formatExpiration(notary.commissionExpiration)}</TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={notary.isVerified}
                                      disabled={updatingId === notary.id}
                                      onCheckedChange={() => {
                                        if (notary.isVerified) {
                                          // Show confirmation dialog when unverifying
                                          document.getElementById(`confirm-unverify-${notary.id}`)?.click()
                                        } else {
                                          // Directly verify without confirmation
                                          toggleVerification(notary)
                                        }
                                      }}
                                    />
                                    {updatingId === notary.id && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {/* Hidden trigger for the dialog */}
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <button id={`confirm-unverify-${notary.id}`} className="hidden">
                                          Open
                                        </button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Confirm Unverify</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This will remove the verification status from {notary.name}. Are you sure?
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => toggleVerification(notary)}>
                                            Confirm
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {notary.isVerified ? "Verified notary" : "Not verified"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant={notary.isActive ? "default" : "outline"}
                                      size="sm"
                                      disabled={updatingId === notary.id}
                                      onClick={() => toggleActiveStatus(notary.id, notary.isActive)}
                                      className="flex items-center gap-1"
                                    >
                                      {updatingId === notary.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : notary.isActive ? (
                                        "Visible"
                                      ) : (
                                        "Hidden"
                                      )}
                                    </Button>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {notary.isActive
                                    ? "Active - Visible in public directory"
                                    : "Inactive - Hidden from public directory"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>{formatDate(notary.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => window.open(`/notary/${notary.id}`, "_blank")}
                                title="View notary profile in new window"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1 border-red-200 hover:bg-red-50 hover:text-red-600"
                                    title="Delete notary"
                                    disabled={deletingId === notary.id}
                                  >
                                    {deletingId === notary.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3 w-3 text-red-500" />
                                    )}
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete {notary.name} from the system. This action cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteNotary(notary)}
                                      className="bg-red-600 hover:bg-red-700"
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
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-sm text-gray-500 mt-8">
            <p>
              Total Notaries: {notaries.length} | Verified: {notaries.filter((n) => n.isVerified).length} | Active
              (Visible): {notaries.filter((n) => n.isActive).length} | Public Directory:{" "}
              {notaries.filter((n) => n.isVerified && n.isActive).length}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="slider">
          <SliderManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
