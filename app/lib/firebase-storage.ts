import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { doc, updateDoc } from "firebase/firestore"
import { storage, db } from "./firebase"

/**
 * Uploads an image to Firebase Storage and updates the user's profile in Firestore
 * @param userId The user's ID
 * @param file The image file to upload
 * @returns Promise with the download URL
 */
export async function uploadProfileImage(
  userId: string,
  file: File,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log(`Starting profile image upload for user ${userId}`)

    // 1. Create a reference to the storage location
    const storageRef = ref(storage, `notary-profiles/${userId}/profile-image`)
    console.log("Storage reference created")

    // 2. Add metadata to the file
    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
      },
    }

    // 3. Upload the file to Firebase Storage
    console.log("Uploading file to Firebase Storage...")
    const uploadResult = await uploadBytes(storageRef, file, metadata)
    console.log("File uploaded successfully to Firebase Storage")

    // 4. Get the download URL
    console.log("Getting download URL...")
    const downloadURL = await getDownloadURL(uploadResult.ref)
    console.log("Download URL obtained:", downloadURL)

    // 5. Update the user's profile in Firestore
    console.log("Updating Firestore document...")
    const userDocRef = doc(db, "notaries", userId)
    await updateDoc(userDocRef, {
      profileImageUrl: downloadURL,
      updatedAt: Date.now(),
    })
    console.log("Firestore document updated successfully")

    return { success: true, url: downloadURL }
  } catch (error: any) {
    console.error("Error in profile image upload:", error)

    // Provide specific error messages based on error type
    if (error.code === "storage/unauthorized") {
      return {
        success: false,
        error: "Permission denied: You don't have permission to upload images to Firebase Storage.",
      }
    } else if (error.code === "storage/canceled") {
      return {
        success: false,
        error: "Upload was cancelled. Please try again.",
      }
    } else if (error.code?.includes("firestore")) {
      return {
        success: false,
        error: "Image was uploaded to storage but couldn't update your profile. Please try again.",
      }
    } else {
      return {
        success: false,
        error: `Upload failed: ${error.message || "Unknown error"}`,
      }
    }
  }
}
