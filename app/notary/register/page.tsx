"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClientOnly } from "../../components/client-only"
import { AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// US States for dropdown
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
  "District of Columbia",
]

// Form validation schema
const signupSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  commissionNumber: z.string().min(1, "Commission number is required"),
  state: z.string().min(1, "State is required"),
  commissionExpiration: z.date({
    required_error: "Commission expiration date is required",
  }),
  insuranceCompany: z.string().min(1, "Insurance company is required"),
  policyNumber: z.string().min(1, "Policy number is required"),
  coverageAmount: z.string().min(1, "Coverage amount is required"),
  insuranceExpiration: z.date({
    required_error: "Insurance expiration date is required",
  }),
})

type FormData = z.infer<typeof signupSchema>

export default function NotaryRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState<Partial<FormData>>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Date picker states
  const [commissionExpirationOpen, setCommissionExpirationOpen] = useState(false)
  const [insuranceExpirationOpen, setInsuranceExpirationOpen] = useState(false)

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear validation error for this field if it exists
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Validate a single field
  const validateField = (field: keyof FormData, value: any): string | null => {
    try {
      const fieldSchema = signupSchema.shape[field]
      fieldSchema.parse(value)
      return null
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || "Invalid input"
      }
      return "Validation error"
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validate all fields
    const errors: Record<string, string> = {}
    Object.entries(formData).forEach(([key, value]) => {
      const fieldName = key as keyof FormData
      const errorMessage = validateField(fieldName, value)
      if (errorMessage) {
        errors[fieldName] = errorMessage
      }
    })

    // Check for missing required fields
    signupSchema._getCached().shape.forEach((_, key) => {
      if (formData[key as keyof FormData] === undefined) {
        errors[key] = `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")} is required`
      }
    })

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setLoading(true)

    try {
      // Initialize Firebase
      const { getAuth, createUserWithEmailAndPassword } = await import("firebase/auth")
      const { doc, setDoc } = await import("firebase/firestore")
      const { auth, firestore } = await import("@/lib/firebase")

      // Create user with email and password
      const { user } = await createUserWithEmailAndPassword(auth, formData.email as string, formData.password as string)

      // Store user data in Firestore with the specified fields
      await setDoc(doc(firestore, "users", user.uid), {
        email: user.email,
        fullName: formData.fullName,
        notaryCommissionNumber: formData.commissionNumber,
        state: formData.state,
        commissionExpirationDate: formData.commissionExpiration,
        eoInsuranceCompany: formData.insuranceCompany,
        eoPolicyNumber: formData.policyNumber,
        eoAmount: formData.coverageAmount,
        eoExpirationDate: formData.insuranceExpiration,
        role: "notary", // default role
        isApproved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      setSuccess(true)

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/notary/dashboard")
      }, 2000)
    } catch (err: any) {
      console.error("Registration error:", err)

      // Handle Firebase auth errors
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please use a different email or try logging in.")
      } else {
        setError(err.message || "Failed to register. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="inline-flex items-center text-amber-700 hover:text-amber-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center p-4 py-8">
          <Card className="w-full max-w-3xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Register as a Notary</CardTitle>
              <CardDescription className="text-center">
                Create your account to offer notary services on our platform
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-6 bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    Registration successful! Redirecting to your dashboard...
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-lg font-medium">Personal Information</h3>

                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={formData.fullName || ""}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className={validationErrors.fullName ? "border-red-500" : ""}
                      />
                      {validationErrors.fullName && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        value={formData.email || ""}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={validationErrors.email ? "border-red-500" : ""}
                      />
                      {validationErrors.email && <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>}
                    </div>

                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password || ""}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className={validationErrors.password ? "border-red-500" : ""}
                      />
                      {validationErrors.password && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
                    </div>
                  </div>

                  {/* Notary Commission Information */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-lg font-medium">Notary Commission Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="commissionNumber">Commission Number</Label>
                        <Input
                          id="commissionNumber"
                          placeholder="123456789"
                          value={formData.commissionNumber || ""}
                          onChange={(e) => handleInputChange("commissionNumber", e.target.value)}
                          className={validationErrors.commissionNumber ? "border-red-500" : ""}
                        />
                        {validationErrors.commissionNumber && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.commissionNumber}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="state">State</Label>
                        <Select onValueChange={(value) => handleInputChange("state", value)} value={formData.state}>
                          <SelectTrigger className={validationErrors.state ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {US_STATES.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {validationErrors.state && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.state}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="commissionExpiration">Commission Expiration Date</Label>
                      <Popover open={commissionExpirationOpen} onOpenChange={setCommissionExpirationOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.commissionExpiration && "text-muted-foreground",
                              validationErrors.commissionExpiration && "border-red-500",
                            )}
                          >
                            {formData.commissionExpiration ? (
                              format(formData.commissionExpiration, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.commissionExpiration}
                            onSelect={(date) => {
                              handleInputChange("commissionExpiration", date)
                              setCommissionExpirationOpen(false)
                            }}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      {validationErrors.commissionExpiration && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.commissionExpiration}</p>
                      )}
                    </div>
                  </div>

                  {/* E&O Insurance Information */}
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-lg font-medium">E&O Insurance Information</h3>

                    <div>
                      <Label htmlFor="insuranceCompany">E&O Insurance Company</Label>
                      <Input
                        id="insuranceCompany"
                        placeholder="Insurance Company Name"
                        value={formData.insuranceCompany || ""}
                        onChange={(e) => handleInputChange("insuranceCompany", e.target.value)}
                        className={validationErrors.insuranceCompany ? "border-red-500" : ""}
                      />
                      {validationErrors.insuranceCompany && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.insuranceCompany}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="policyNumber">Policy Number</Label>
                        <Input
                          id="policyNumber"
                          placeholder="POL-123456"
                          value={formData.policyNumber || ""}
                          onChange={(e) => handleInputChange("policyNumber", e.target.value)}
                          className={validationErrors.policyNumber ? "border-red-500" : ""}
                        />
                        {validationErrors.policyNumber && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.policyNumber}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="coverageAmount">Coverage Amount</Label>
                        <Input
                          id="coverageAmount"
                          placeholder="$100,000"
                          value={formData.coverageAmount || ""}
                          onChange={(e) => handleInputChange("coverageAmount", e.target.value)}
                          className={validationErrors.coverageAmount ? "border-red-500" : ""}
                        />
                        {validationErrors.coverageAmount && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.coverageAmount}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="insuranceExpiration">E&O Expiration Date</Label>
                      <Popover open={insuranceExpirationOpen} onOpenChange={setInsuranceExpirationOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.insuranceExpiration && "text-muted-foreground",
                              validationErrors.insuranceExpiration && "border-red-500",
                            )}
                          >
                            {formData.insuranceExpiration ? (
                              format(formData.insuranceExpiration, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.insuranceExpiration}
                            onSelect={(date) => {
                              handleInputChange("insuranceExpiration", date)
                              setInsuranceExpirationOpen(false)
                            }}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      {validationErrors.insuranceExpiration && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.insuranceExpiration}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-amber-700 hover:bg-amber-800"
                    disabled={loading || success}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>

            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/notary/login" className="text-amber-700 hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t py-6">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} NotaryOutlet. All rights reserved.
          </div>
        </footer>
      </div>
    </ClientOnly>
  )
}
