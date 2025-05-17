"use client"

import type React from "react"

import { AuthProvider } from "@/app/components/auth/AuthProvider"

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
