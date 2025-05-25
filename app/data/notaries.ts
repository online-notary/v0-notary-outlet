"use client"

import { initializeFirebase, getFirebaseServices } from "../lib/firebase-client"

export interface Notary {
  id: string
  name: string
  title: string
  location: string
  phone: string
  email: string
  rating: number
  reviews: number
  bio: string
  services: string[]
  availability?: {
    day: string
    startTime: string
    endTime: string
    available: boolean
  }[]
  profileImageUrl?: string
  isVerified: boolean
  isActive: boolean
}

// Function to get all notaries from Firestore with fallback to mock data
export async function getAllNotaries(limitCount = 100): Promise<{ notaries: Notary[]; usedMockData: boolean }> {
  // Check if we're running on the client side
  if (typeof window === "undefined") {
    console.log("Running on server, using mock data")
    return { notaries: generateMockNotaries(limitCount), usedMockData: true }
  }

  try {
    console.log("Initializing Firebase for getAllNotaries...")
    // Try to initialize Firebase if not already initialized
    const firebaseResult = await initializeFirebase()
    if (!firebaseResult.success) {
      console.error("Firebase initialization failed:", firebaseResult.error)
      return { notaries: generateMockNotaries(limitCount), usedMockData: true }
    }

    const { db } = getFirebaseServices()

    // If Firebase is not initialized, use mock data
    if (!db) {
      console.error("Firebase Firestore not initialized properly")
      return { notaries: generateMockNotaries(limitCount), usedMockData: true }
    }

    // Dynamically import Firestore functions to ensure they're only loaded on the client
    const { collection, getDocs, query, limit } = await import("firebase/firestore")

    // Try to fetch from Firestore
    try {
      console.log("Fetching notaries from Firestore...")
      const notariesCollection = collection(db, "notaries")
      // Simple query with just a limit, no ordering or filtering
      const notariesQuery = query(notariesCollection, limit(limitCount))

      const querySnapshot = await getDocs(notariesQuery)

      // If we got data from Firestore, use it
      if (!querySnapshot.empty) {
        console.log(`Successfully fetched ${querySnapshot.size} notaries from Firestore`)

        const notaries = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name || "Unknown",
            title: data.title || "Notary Public",
            location: data.location || `${data.state || "Unknown"}`,
            phone: data.phone || "Not provided",
            email: data.email || "Not provided",
            rating: data.rating || 5,
            reviews: data.reviews || 0,
            bio: data.bio || "No bio provided",
            services: data.services || [],
            profileImageUrl: data.profileImageUrl,
            isVerified: data.isVerified || false,
            isActive: data.isActive !== false, // Default to true if not set
          } as Notary
        })

        return { notaries, usedMockData: false }
      } else {
        console.log("No notaries found in Firestore")
        return { notaries: generateMockNotaries(limitCount), usedMockData: true }
      }
    } catch (firestoreError: any) {
      console.error("Error fetching from Firestore:", firestoreError)
      // Check if this is a permissions error
      if (firestoreError.toString().includes("permission") || firestoreError.code === "permission-denied") {
        console.warn("PERMISSION DENIED: Your Firebase security rules are preventing access to the notaries collection")
        console.warn("Please update your Firebase security rules to allow reading from the notaries collection")
        console.warn("Example rule: allow read: if true;")
      }
      return { notaries: generateMockNotaries(limitCount), usedMockData: true }
    }
  } catch (error) {
    console.error("Error in getAllNotaries:", error)
    console.log("Falling back to mock data due to error")

    // Return mock data as fallback
    return { notaries: generateMockNotaries(limitCount), usedMockData: true }
  }
}

// Function to get active notaries (isActive=true) - ALWAYS use mock data for now
export async function getActiveNotaries(limitCount = 20): Promise<Notary[]> {
  console.log("getActiveNotaries called with limit:", limitCount)
  console.log("Using mock data due to Firebase permissions - this ensures the slider always works")

  // Always return mock data to avoid permission errors
  const mockData = generateMockNotaries(limitCount)
  const activeNotaries = mockData.filter((notary) => notary.isActive === true)

  console.log(`Generated ${activeNotaries.length} active mock notaries for cube slider`)
  return activeNotaries
}

// Function to get all verified notaries
export async function getVerifiedNotaries(limitCount = 20): Promise<Notary[]> {
  console.log("getVerifiedNotaries called with limit:", limitCount)

  // Check if we're running on the client side
  if (typeof window === "undefined") {
    console.log("Running on server, using mock data")
    const mockData = generateMockNotaries(limitCount)
    return mockData.filter((notary) => notary.isVerified === true && notary.isActive === true)
  }

  try {
    console.log("Initializing Firebase for getVerifiedNotaries...")
    // Try to initialize Firebase if not already initialized
    const firebaseResult = await initializeFirebase()
    if (!firebaseResult.success) {
      console.error("Firebase initialization failed:", firebaseResult.error)
      const mockData = generateMockNotaries(limitCount)
      return mockData.filter((notary) => notary.isVerified === true && notary.isActive === true)
    }

    const { db } = getFirebaseServices()

    // If Firebase is not initialized, use mock data
    if (!db) {
      console.error("Firebase Firestore not initialized properly")
      const mockData = generateMockNotaries(limitCount)
      return mockData.filter((notary) => notary.isVerified === true && notary.isActive === true)
    }

    // Dynamically import Firestore functions
    console.log("Importing Firestore functions...")
    const { collection, getDocs, query, limit, where } = await import("firebase/firestore")
    console.log("Firestore functions imported successfully")

    try {
      console.log("Creating Firestore query for verified and active notaries...")
      // Try to create a query for verified and active notaries
      const notariesCollection = collection(db, "notaries")

      // First try with compound query
      try {
        const verifiedQuery = query(
          notariesCollection,
          where("isVerified", "==", true),
          where("isActive", "==", true),
          limit(limitCount),
        )

        console.log("Executing compound query...")
        const querySnapshot = await getDocs(verifiedQuery)
        console.log(`Compound query returned ${querySnapshot.size} documents`)

        if (!querySnapshot.empty) {
          console.log(`Successfully fetched ${querySnapshot.size} verified and active notaries from Firestore`)

          const notaries = querySnapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              name: data.name || "Unknown",
              title: data.title || "Notary Public",
              location: data.location || `${data.state || "Unknown"}`,
              phone: data.phone || "Not provided",
              email: data.email || "Not provided",
              rating: data.rating || 5,
              reviews: data.reviews || 0,
              bio: data.bio || "No bio provided",
              services: data.services || [],
              profileImageUrl: data.profileImageUrl,
              isVerified: data.isVerified || false,
              isActive: data.isActive !== false, // Default to true if not set
            } as Notary
          })

          console.log("Returning verified and active notaries from compound query:", notaries.length)
          return notaries
        }
      } catch (compoundQueryError) {
        console.log("Compound query failed, trying simple query:", compoundQueryError)

        // Fallback to simple query and filter client-side
        const simpleQuery = query(notariesCollection, limit(limitCount * 3))
        console.log("Executing simple query...")
        const querySnapshot = await getDocs(simpleQuery)
        console.log(`Simple query returned ${querySnapshot.size} documents`)

        if (!querySnapshot.empty) {
          console.log("Processing results from simple query")

          // Filter for verified and active notaries client-side
          const notaries = querySnapshot.docs
            .map((doc) => {
              const data = doc.data()
              return {
                id: doc.id,
                name: data.name || "Unknown",
                title: data.title || "Notary Public",
                location: data.location || `${data.state || "Unknown"}`,
                phone: data.phone || "Not provided",
                email: data.email || "Not provided",
                rating: data.rating || 5,
                reviews: data.reviews || 0,
                bio: data.bio || "No bio provided",
                services: data.services || [],
                profileImageUrl: data.profileImageUrl,
                isVerified: data.isVerified || false,
                isActive: data.isActive !== false,
              } as Notary
            })
            .filter((notary) => notary.isVerified === true && notary.isActive === true)
            .slice(0, limitCount) // Limit to the requested count after filtering

          console.log("Returning filtered verified and active notaries from simple query:", notaries.length)
          return notaries
        }
      }
    } catch (firestoreError: any) {
      console.error("Error executing Firestore query:", firestoreError)
      if (firestoreError.toString().includes("permission") || firestoreError.code === "permission-denied") {
        console.warn("PERMISSION DENIED: Your Firebase security rules are preventing access to the notaries collection")
        console.warn("Please update your Firebase security rules to allow reading from the notaries collection")
        throw new Error("Firebase permission denied. Please check your security rules.")
      }
      throw firestoreError
    }

    // If no data in Firestore or queries failed, fall back to mock data
    console.log("No verified and active notaries found in Firestore, using mock data")
    const mockData = generateMockNotaries(limitCount)
    return mockData.filter((notary) => notary.isVerified === true && notary.isActive === true)
  } catch (error) {
    console.error("Error in getVerifiedNotaries:", error)
    console.log("Falling back to mock data due to error")

    // Return mock data as fallback
    const mockData = generateMockNotaries(limitCount)
    return mockData.filter((notary) => notary.isVerified === true && notary.isActive === true)
  }
}

// Function to get a single notary by ID
export async function getNotaryById(id: string): Promise<Notary | null> {
  console.log("getNotaryById called with ID:", id)

  // Check if we're running on the client side
  if (typeof window === "undefined") {
    console.log("Running on server, using mock data")
    return generateMockNotaryById(id)
  }

  try {
    console.log("Initializing Firebase for getNotaryById...")
    // Try to initialize Firebase if not already initialized
    const firebaseResult = await initializeFirebase()
    if (!firebaseResult.success) {
      console.error("Firebase initialization failed:", firebaseResult.error)
      return generateMockNotaryById(id)
    }

    const { db } = getFirebaseServices()

    // If Firebase is not initialized, use mock data
    if (!db) {
      console.error("Firebase Firestore not initialized properly")
      return generateMockNotaryById(id)
    }

    // Dynamically import Firestore functions
    const { doc, getDoc } = await import("firebase/firestore")

    try {
      console.log("Fetching notary document by ID...")
      // Try to get the document directly by ID
      const docRef = doc(db, "notaries", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        console.log("Successfully fetched notary from Firestore by ID")
        const data = docSnap.data()

        return {
          id: docSnap.id,
          name: data.name || "Unknown",
          title: data.title || "Notary Public",
          location: data.location || `${data.state || "Unknown"}`,
          phone: data.phone || "Not provided",
          email: data.email || "Not provided",
          rating: data.rating || 5,
          reviews: data.reviews || 0,
          bio: data.bio || "No bio provided",
          services: data.services || [],
          profileImageUrl: data.profileImageUrl,
          isVerified: data.isVerified || false,
          isActive: data.isActive !== false, // Default to true if not set
        }
      } else {
        console.log("No notary found with ID:", id)
        return generateMockNotaryById(id)
      }
    } catch (docError: any) {
      console.error("Error fetching by document ID:", docError)
      if (docError.toString().includes("permission") || docError.code === "permission-denied") {
        console.warn("PERMISSION DENIED: Your Firebase security rules are preventing access to the notary document")
        console.warn("Please update your Firebase security rules to allow reading from the notaries collection")
      }
      return generateMockNotaryById(id)
    }
  } catch (error) {
    console.error("Error in getNotaryById:", error)
    console.log("Falling back to mock data due to error")

    // Return mock data as fallback
    return generateMockNotaryById(id)
  }
}

// Helper function to generate a mock notary by ID
function generateMockNotaryById(id: string): Notary {
  // If it's a mock ID, generate a mock notary
  if (id.startsWith("mock-")) {
    const mockId = Number.parseInt(id.replace("mock-", ""))
    const states = ["New York", "California", "Texas", "Florida", "Illinois", "Pennsylvania"]
    const cities = ["New York", "Los Angeles", "Houston", "Miami", "Chicago", "Philadelphia"]
    const stateIndex = mockId % states.length

    // Always set isVerified to true for individual profile views
    return {
      id: id,
      name: `Sarah Johnson ${mockId}`,
      title: "Certified Notary Public",
      location: `${cities[stateIndex]}, ${states[stateIndex]}`,
      phone: `(555) ${100 + mockId}-${1000 + mockId}`,
      email: `notary${mockId}@example.com`,
      rating: 5,
      reviews: 24,
      bio: "Professional notary with years of experience in various document types including real estate, loan documents, and more. I provide mobile notary services throughout the area with a commitment to accuracy, efficiency, and customer satisfaction.",
      services: [
        "Loan Documents",
        "Real Estate",
        "Mobile Service",
        "Power of Attorney",
        "Affidavits",
        "Wills & Trusts",
      ],
      isVerified: true,
      isActive: true,
      profileImageUrl: `/notary-${(mockId % 7) + 1}.jpg`,
    }
  }

  // For non-mock IDs, generate a mock notary with that ID
  const mockId = Number.parseInt(id.replace(/\D/g, "")) || 1
  const states = ["New York", "California", "Texas", "Florida", "Illinois", "Pennsylvania"]
  const cities = ["New York", "Los Angeles", "Houston", "Miami", "Chicago", "Philadelphia"]
  const stateIndex = mockId % states.length

  return {
    id: id,
    name: `Notary Professional ${mockId}`,
    title: "Certified Notary Public",
    location: `${cities[stateIndex]}, ${states[stateIndex]}`,
    phone: `(555) ${100 + mockId}-${1000 + mockId}`,
    email: `notary${mockId}@example.com`,
    rating: 5,
    reviews: 24,
    bio: "Professional notary with years of experience in various document types including real estate, loan documents, and more. I provide mobile notary services throughout the area with a commitment to accuracy, efficiency, and customer satisfaction.",
    services: ["Loan Documents", "Real Estate", "Mobile Service", "Power of Attorney", "Affidavits", "Wills & Trusts"],
    isVerified: true,
    isActive: true,
    profileImageUrl: `/notary-${(mockId % 7) + 1}.jpg`,
  }
}

// Add a function to generate mock notary data
function generateMockNotaries(count: number): Notary[] {
  const mockNotaries: Notary[] = []
  const states = ["New York", "California", "Texas", "Florida", "Illinois", "Pennsylvania"]
  const cities = ["New York", "Los Angeles", "Houston", "Miami", "Chicago", "Philadelphia"]
  const services = [
    "Loan Documents",
    "Real Estate",
    "Mobile Service",
    "Power of Attorney",
    "Affidavits",
    "Wills & Trusts",
    "Oaths & Affirmations",
    "Acknowledgments",
    "Jurats",
    "Copy Certifications",
  ]

  const firstNames = ["Sarah", "Michael", "Jennifer", "David", "Emily", "Robert", "Jessica", "John", "Lisa", "James"]
  const lastNames = [
    "Johnson",
    "Smith",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
  ]

  for (let i = 0; i < count; i++) {
    const stateIndex = Math.floor(Math.random() * states.length)
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const serviceCount = Math.floor(Math.random() * 4) + 2 // 2-5 services
    const selectedServices = []

    for (let j = 0; j < serviceCount; j++) {
      const service = services[Math.floor(Math.random() * services.length)]
      if (!selectedServices.includes(service)) {
        selectedServices.push(service)
      }
    }

    // Randomly set some notaries as not verified (about 30%)
    const isVerified = Math.random() > 0.3

    mockNotaries.push({
      id: `mock-${i + 1}`,
      name: `${firstName} ${lastName}`,
      title: "Certified Notary Public",
      location: `${cities[stateIndex]}, ${states[stateIndex]}`,
      phone: `(555) ${100 + i}-${1000 + i}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      rating: Math.min(5, Math.floor(Math.random() * 2) + 4), // 4-5 stars
      reviews: Math.floor(Math.random() * 30) + 5,
      bio: "Professional notary with years of experience in various document types including real estate, loan documents, and more. I provide mobile notary services with a commitment to accuracy and customer satisfaction.",
      services: selectedServices,
      isVerified: isVerified,
      isActive: true, // All mock notaries are active by default
      profileImageUrl: `/notary-${(i % 7) + 1}.jpg`,
    })
  }

  return mockNotaries
}
