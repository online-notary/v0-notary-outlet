/**
 * Generates a random password with specified complexity
 * @param length Password length (default: 12)
 * @returns A random password
 */
export function generatePassword(length = 12): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const numbers = "0123456789"
  const symbols = "!@#$%^&*()_+[]{}|;:,.<>?"

  const allChars = lowercase + uppercase + numbers + symbols

  // Ensure at least one of each character type
  let password =
    lowercase.charAt(Math.floor(Math.random() * lowercase.length)) +
    uppercase.charAt(Math.floor(Math.random() * uppercase.length)) +
    numbers.charAt(Math.floor(Math.random() * numbers.length)) +
    symbols.charAt(Math.floor(Math.random() * symbols.length))

  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length))
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("")
}
