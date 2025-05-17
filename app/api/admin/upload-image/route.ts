import { type NextRequest, NextResponse } from "next/server"
import { getAuth } from "firebase-admin/auth"
import { getStorage } from "firebase-admin/storage"
import { initializeFirebaseAdmin } from "@/app/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    // Initialize Firebase Admin
    const app = initializeFirebaseAdmin()

    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split("Bearer ")[1]
    let decodedToken
    try {
      decodedToken = await getAuth(app).verifyIdToken(token)
    } catch (error) {
      console.error("Error verifying token:", error)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Check if user is admin (amy@mediadrops.net)
    if (decodedToken.email !== "amy@mediadrops.net") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const notaryId = formData.get("notaryId") as string
    const sliderId = formData.get("sliderId") as string
    const folder = formData.get("folder") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Determine the storage path based on the parameters
    let storagePath
    if (folder === "slider") {
      storagePath = `slider/${sliderId || Date.now()}_${file.name}`
    } else {
      storagePath = `notaries/${notaryId || "unknown"}/${Date.now()}_${file.name}`
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Firebase Storage
    const bucket = getStorage(app).bucket()
    const fileRef = bucket.file(storagePath)

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    })

    // Make the file publicly accessible
    await fileRef.makePublic()

    // Get the public URL
    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`

    return NextResponse.json({ success: true, imageUrl })
  } catch (error: any) {
    console.error("Error in upload-image API route:", error)
    return NextResponse.json({ error: error.message || "An error occurred while uploading the image" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
