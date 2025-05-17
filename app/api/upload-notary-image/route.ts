import { type NextRequest, NextResponse } from "next/server"
import { getAuth } from "firebase-admin/auth"
import { initAdmin } from "@/app/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    // Initialize Firebase Admin
    const app = initAdmin()

    // Check authentication
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split("Bearer ")[1]

    try {
      const decodedToken = await getAuth().verifyIdToken(token)
      const email = decodedToken.email

      // Check if user is admin
      if (email !== "amy@mediadrops.net") {
        return NextResponse.json({ error: "Forbidden: Only admins can upload images" }, { status: 403 })
      }
    } catch (error) {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 })
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const notaryId = formData.get("notaryId") as string

    if (!file || !notaryId) {
      return NextResponse.json({ error: "Missing file or notaryId" }, { status: 400 })
    }

    // In a real implementation, you would upload the file to Firebase Storage here
    // For now, we'll just return a placeholder URL
    const placeholderUrl = `/placeholder.svg?height=200&width=200&query=notary profile for ${notaryId}`

    return NextResponse.json({
      success: true,
      imageUrl: placeholderUrl,
    })
  } catch (error) {
    console.error("Error in upload API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
