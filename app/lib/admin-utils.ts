import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"
import { app } from "@/app/lib/firebase"

/**
 * Sets the isAdmin field for a notary with the specified email
 */
export async function setNotaryAsAdmin(email: string, isAdmin = true) {
  try {
    const db = getFirestore(app)
    const notariesRef = collection(db, "notaries")

    // Query for the notary with the specified email
    const q = query(notariesRef, where("email", "==", email))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      console.error(`No notary found with email: ${email}`)
      return { success: false, message: `No notary found with email: ${email}` }
    }

    // Update the notary document
    const notaryDoc = querySnapshot.docs[0]
    await updateDoc(doc(db, "notaries", notaryDoc.id), {
      isAdmin: isAdmin,
      adminSetAt: new Date().toISOString(),
    })

    return {
      success: true,
      message: `Successfully ${isAdmin ? "set" : "removed"} admin status for ${email}`,
      notaryId: notaryDoc.id,
    }
  } catch (error) {
    console.error("Error setting admin status:", error)
    return { success: false, message: `Error: ${error.message}` }
  }
}
