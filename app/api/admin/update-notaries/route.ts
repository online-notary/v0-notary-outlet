import { type NextRequest, NextResponse } from "next/server"
import { getAuth } from "firebase-admin/auth"
import { initAdmin } from "@/app/lib/firebase-admin"
import { addIsVisibleFieldToNotaries } from "@/app/lib/update-notaries"

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
        return NextResponse.json({ error: "Forbidden: Only admins can update notaries" }, { status: 403 })
      }
    } catch (error) {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 })
    }

    // Run the migration
    const result = await addIsVisibleFieldToNotaries()

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error in update notaries API route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
