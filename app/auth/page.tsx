"use client"

import { useState } from "react"
import { useAuth } from "../components/auth/AuthProvider"
import SignInForm from "../components/auth/SignInForm"
import SignUpForm from "../components/auth/SignUpForm"
import UserProfile from "../components/auth/UserProfile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AuthPage() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState("signin")

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-8 text-center">Your Account</h1>
          <UserProfile />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8 text-center">Account Access</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <SignInForm />
          </TabsContent>
          <TabsContent value="signup">
            <SignUpForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
