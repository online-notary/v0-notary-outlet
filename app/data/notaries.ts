import { collection, getDocs, query, where, limit as firestoreLimit } from "firebase/firestore"
import { getFirestore } from "@/app/lib/firebase"

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
  isActive: boolean // This controls visibility
}

// Function to get all notaries from Firestore with fallback to mock data
export async function getAllNotaries(limitCount = 100): Promise<{ notaries: Notary[]; usedMockData: boolean }> {
  // Check if we're running on the client side
  if (typeof window === "undefined") {
    console.log("Running on server, using mock data")
    return { notaries: generateMockNotaries(limitCount), usedMockData: true }
  }

  try {
    console.log("Attempting to fetch notaries from Firestore...")

    // Get the Firestore instance
    const db = await getFirestore()

    if (!db) {
      console.log("Firestore not initialized, using mock data")
      return { notaries: generateMockNotaries(limitCount), usedMockData: true }
    }

    // Try to fetch from Firestore - simplified query to avoid index requirements
    const notariesCollection = collection(db, "notaries")
    const notariesQuery = query(notariesCollection, firestoreLimit(limitCount))

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

      // Sort by name client-side to avoid requiring an index
      notaries.sort((a, b) => a.name.localeCompare(b.name))

      return { notaries, usedMockData: false }
    }

    // If no data in Firestore, fall back to mock data
    console.log("No notaries found in Firestore, using mock data")
    return { notaries: generateMockNotaries(limitCount), usedMockData: true }
  } catch (error) {
    console.error("Error fetching notaries from Firestore:", error)
    console.log("Falling back to mock data due to error")

    // Return mock data as fallback
    return { notaries: generateMockNotaries(limitCount), usedMockData: true }
  }
}

// Function to get all verified notaries
export async function getVerifiedNotaries(limitCount = 20): Promise<Notary[]> {
  // Check if we're running on the client side
  if (typeof window === "undefined") {
    console.log("Running on server, using mock data")
    const mockData = generateMockNotaries(limitCount)
    return mockData.filter((notary) => notary.isVerified === true && notary.isActive === true)
  }

  try {
    console.log("Attempting to fetch notaries from Firestore...")

    // Get the Firestore instance
    const db = await getFirestore()

    if (!db) {
      console.log("Firestore not initialized, using mock data")
      const mockData = generateMockNotaries(limitCount)
      return mockData.filter((notary) => notary.isVerified === true && notary.isActive === true)
    }

    // Simplified query to avoid index requirements
    const notariesCollection = collection(db, "notaries")
    const notariesQuery = query(notariesCollection, firestoreLimit(limitCount))

    const querySnapshot = await getDocs(notariesQuery)

    // If we got data from Firestore, filter and use it
    if (!querySnapshot.empty) {
      console.log(`Successfully fetched ${querySnapshot.size} notaries from Firestore`)

      const allNotaries = querySnapshot.docs.map((doc) => {
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

      // Filter for verified and active notaries client-side
      const verifiedNotaries = allNotaries.filter((notary) => notary.isVerified === true && notary.isActive === true)

      console.log(`Found ${verifiedNotaries.length} verified and active notaries out of ${allNotaries.length} total`)

      // Sort by name
      verifiedNotaries.sort((a, b) => a.name.localeCompare(b.name))

      // Limit the results
      return verifiedNotaries.slice(0, limitCount)
    }
  } catch (error) {
    console.error("Error fetching notaries from Firestore:", error)
  }

  // Generate mock data as fallback
  const mockData = generateMockNotaries(limitCount)

  // Filter to only include verified and active notaries
  const verifiedNotaries = mockData.filter((notary) => notary.isVerified === true && notary.isActive === true)

  console.log(
    `Using mock notary data: Found ${verifiedNotaries.length} verified and active notaries out of ${mockData.length} total`,
  )
  return verifiedNotaries
}

// Function to get a single notary by ID
export async function getNotaryById(id: string): Promise<Notary | null> {
  // Check if we're running on the client side
  if (typeof window === "undefined") {
    console.log("Running on server, using mock data")
    // Generate a mock notary with the given ID
    return generateMockNotaryById(id)
  }

  try {
    console.log("Attempting to fetch notary from Firestore:", id)

    // Get the Firestore instance
    const db = await getFirestore()

    if (!db) {
      console.log("Firestore not initialized, using mock data")
      return generateMockNotaryById(id)
    }

    // Try to fetch from Firestore first - simplified query
    const notaryDoc = await getDocs(query(collection(db, "notaries"), where("uid", "==", id)))

    if (!notaryDoc.empty) {
      console.log("Successfully fetched notary from Firestore")
      const data = notaryDoc.docs[0].data()

      return {
        id: notaryDoc.docs[0].id,
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
    }
  } catch (error) {
    console.error("Error fetching notary from Firestore:", error)
  }

  // Generate a mock notary with the given ID
  return generateMockNotaryById(id)
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
    }
  }

  // For non-mock IDs, generate a mock notary with that ID
  console.log("Using mock data for notary due to Firestore permission issues")
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
    })
  }

  return mockNotaries
}
