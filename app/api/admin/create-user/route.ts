import { type NextRequest, NextResponse } from "next/server"
import { getAuth } from "firebase-admin/auth"
import { initAdmin } from "@/app/lib/firebase-admin"
import { generatePassword } from "@/app/lib/password-utils"

export async function POST(request: NextRequest) {
  try {
    // Initialize Firebase Admin
    const app = initAdmin()

    // Verify admin authentication
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split("Bearer ")[1]

    try {
      const decodedToken = await getAuth(app).verifyIdToken(token)
      const email = decodedToken.email

      // Check if user is admin
      if (email !== "amy@mediadrops.net") {
        return NextResponse.json({ error: "Forbidden: Only admins can create users" }, { status: 403 })
      }
    } catch (error) {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 })
    }

    // Get request body
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user already exists
    try {
      const userRecord = await getAuth(app).getUserByEmail(email)
      return NextResponse.json({
        success: true,
        message: "User already exists",
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        },
        isExisting: true,
      })
    } catch (error) {
      // User doesn't exist, continue with creation
    }

    // Generate a random password
    const password = generatePassword()

    // Create the user
    const userRecord = await getAuth(app).createUser({
      email,
      password,
      displayName: name,
      emailVerified: true, // Admin-created accounts are pre-verified
    })

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      },
      password,
      isExisting: false,
    })
  } catch (error: any) {
    console.error("Error in create user API route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
