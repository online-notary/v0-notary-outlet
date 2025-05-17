import { db } from "@/app/lib/firebase"
import { collection, getDocs, doc, updateDoc, query, limit } from "firebase/firestore"

/**
 * Updates all notaries in the database to add the isVisible field set to true
 * This is a one-time migration function
 */
export async function addIsVisibleFieldToNotaries() {
  try {
    console.log("Starting migration: Adding isVisible field to notaries...")

    // Get all notaries
    const notariesCollection = collection(db, "notaries")
    const notariesQuery = query(notariesCollection, limit(500)) // Limit to 500 notaries for safety
    const querySnapshot = await getDocs(notariesQuery)

    if (querySnapshot.empty) {
      console.log("No notaries found to update")
      return { success: true, updated: 0, message: "No notaries found to update" }
    }

    // Track updates
    let updatedCount = 0
    let errorCount = 0

    // Update each notary
    const updatePromises = querySnapshot.docs.map(async (docSnapshot) => {
      try {
        const notaryRef = doc(db, "notaries", docSnapshot.id)
        const data = docSnapshot.data()

        // Only update if the field doesn't exist
        if (data.isVisible === undefined) {
          await updateDoc(notaryRef, {
            isVisible: true,
            updatedAt: Date.now(),
          })
          updatedCount++
        }
      } catch (error) {
        console.error(`Error updating notary ${docSnapshot.id}:`, error)
        errorCount++
      }
    })

    // Wait for all updates to complete
    await Promise.all(updatePromises)

    console.log(`Migration complete: Updated ${updatedCount} notaries, ${errorCount} errors`)
    return {
      success: true,
      updated: updatedCount,
      errors: errorCount,
      message: `Updated ${updatedCount} notaries, ${errorCount} errors`,
    }
  } catch (error) {
    console.error("Error in migration:", error)
    return {
      success: false,
      message: `Migration failed: ${error}`,
    }
  }
}
