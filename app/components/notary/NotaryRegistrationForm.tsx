"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

// Types
export interface NotaryProfile {
  uid: string
  email: string
  name: string
  licenseNumber: string
  state: string
  commissionExpiration: string
  phone: string
  address: string
  bio: string
  services: string[]
  isVerified: boolean
  isActive: boolean
  createdAt: number
  updatedAt: number
}

const US_STATES = [
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

const NOTARY_SERVICES = [
  "Loan Documents",
  "Real Estate",
  "Mobile Service",
  "Power of Attorney",
  "Affidavits",
  "Wills & Trusts",
  "Oaths & Affirmations",
  "Acknowledgments",
  "Jurats",
  "Copy Certifications",
  "Depositions",
  "Mortgage Closings",
]

export default function NotaryRegistrationForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    licenseNumber: "",
    state: "",
    commissionExpiration: "",
    phone: "",
    address: "",
    bio: "",
    services: [] as string[],
    agreeToTerms: false,
  })
  const [error, setError] = useState("")
  const [warning, setWarning] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => {
      const services = [...prev.services]
      if (services.includes(service)) {
        return { ...prev, services: services.filter((s) => s !== service) }
      } else {
        return { ...prev, services: [...services, service] }
      }
    })
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, agreeToTerms: checked }))
  }

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all required fields")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }

    return true
  }

  const validateStep2 = () => {
    if (
      !formData.licenseNumber ||
      !formData.state ||
      !formData.commissionExpiration ||
      !formData.phone ||
      !formData.address
    ) {
      setError("Please fill in all required fields")
      return false
    }

    return true
  }

  const validateStep3 = () => {
    if (!formData.bio) {
      setError("Please provide a brief bio")
      return false
    }

    if (formData.services.length === 0) {
      setError("Please select at least one service you offer")
      return false
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the terms and conditions")
      return false
    }

    return true
  }

  const nextStep = () => {
    setError("")

    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const prevStep = () => {
    setError("")
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setWarning("")
    setSuccess("")

    if (!validateStep3()) {
      return
    }

    setLoading(true)

    try {
      // Dynamically import Firebase modules
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth")
      const { doc, setDoc, collection, query, where, getDocs } = await import("firebase/firestore")
      const { auth, db } = await import("@/app/lib/firebase")

      console.log("Starting registration process...")
      console.log("Form data:", { ...formData, password: "***" })

      // Create user account
      console.log("Creating user account with Firebase Auth...")
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      console.log("User created successfully:", userCredential.user.uid)

      // Update display name
      console.log("Updating user profile...")
      await updateProfile(userCredential.user, {
        displayName: formData.name,
      })
      console.log("User profile updated successfully")

      // Create notary profile
      console.log("Creating notary profile in Firestore...")
      const notaryData = {
        uid: userCredential.user.uid,
        email: formData.email,
        name: formData.name,
        licenseNumber: formData.licenseNumber,
        state: formData.state,
        commissionExpiration: formData.commissionExpiration,
        phone: formData.phone,
        address: formData.address,
        bio: formData.bio,
        services: formData.services,
        isVerified: false, // Requires admin verification
        isActive: true,
      }

      try {
        const timestamp = Date.now()
        const notaryDataWithTimestamp = {
          ...notaryData,
          createdAt: timestamp,
          updatedAt: timestamp,
        }

        await setDoc(doc(db, "notaries", userCredential.user.uid), notaryDataWithTimestamp)
        console.log("Notary profile created successfully")
      } catch (error) {
        console.error("Error creating notary profile:", error)
        setWarning(
          "Your account was created, but we couldn't save your profile details. You can update them later in your dashboard.",
        )
      }

      setSuccess("Registration successful! Redirecting to your profile page...")

      // Redirect to profile page
      setTimeout(() => {
        router.push("/notary-profile")
      }, 2000)
    } catch (error: any) {
      console.error("Registration error:", error)
      setError(error.message || "An error occurred during registration")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Notary Registration</CardTitle>
        <CardDescription>Join our network of $5 flat-rate notaries</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {warning && (
          <Alert className="mb-4 bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-600">{warning}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <div className="flex justify-between">
            <div className={`text-center flex-1 ${step >= 1 ? "text-amber-700" : "text-gray-400"}`}>
              <div
                className={`rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 border-2 ${step >= 1 ? "border-amber-700 bg-amber-50" : "border-gray-200"}`}
              >
                1
              </div>
              <div className="text-sm">Account</div>
            </div>
            <div className={`text-center flex-1 ${step >= 2 ? "text-amber-700" : "text-gray-400"}`}>
              <div
                className={`rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 border-2 ${step >= 2 ? "border-amber-700 bg-amber-50" : "border-gray-200"}`}
              >
                2
              </div>
              <div className="text-sm">Credentials</div>
            </div>
            <div className={`text-center flex-1 ${step >= 3 ? "text-amber-700" : "text-gray-400"}`}>
              <div
                className={`rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 border-2 ${step >= 3 ? "border-amber-700 bg-amber-50" : "border-gray-200"}`}
              >
                3
              </div>
              <div className="text-sm">Services</div>
            </div>
          </div>
          <div className="relative mt-2">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded">
              <div
                className="absolute top-0 left-0 h-1 bg-amber-700 rounded transition-all duration-300"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Notary License Number</Label>
                <Input
                  id="licenseNumber"
                  name="licenseNumber"
                  type="text"
                  placeholder="123456789"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select value={formData.state} onValueChange={(value) => handleSelectChange("state", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="commissionExpiration">Commission Expiration Date</Label>
                <Input
                  id="commissionExpiration"
                  name="commissionExpiration"
                  type="date"
                  value={formData.commissionExpiration}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="123 Main St, City, State, ZIP"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell clients about your experience and expertise as a notary..."
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Services Offered</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {NOTARY_SERVICES.map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={`service-${service}`}
                        checked={formData.services.includes(service)}
                        onCheckedChange={() => handleServiceToggle(service)}
                      />
                      <label
                        htmlFor={`service-${service}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {service}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Checkbox id="terms" checked={formData.agreeToTerms} onCheckedChange={handleCheckboxChange} required />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <a href="/terms" className="text-amber-700 hover:underline">
                    Terms and Conditions
                  </a>{" "}
                  and understand that my account requires verification before I can accept clients.
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="border-amber-700 text-amber-700 hover:bg-amber-50"
              >
                Back
              </Button>
            )}

            {step < 3 ? (
              <Button type="button" onClick={nextStep} className="ml-auto bg-amber-700 hover:bg-amber-800">
                Continue
              </Button>
            ) : (
              <Button type="submit" className="ml-auto bg-amber-700 hover:bg-amber-800" disabled={loading}>
                {loading ? "Submitting..." : "Complete Registration"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          Already registered?{" "}
          <a href="/notary/login" className="text-amber-700 hover:underline">
            Sign in to your notary account
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}
