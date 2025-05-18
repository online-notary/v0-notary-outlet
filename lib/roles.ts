// Role definitions
export const ROLES = {
  ADMIN: "admin",
  NOTARY: "notary",
  CLIENT: "client",
  GUEST: "guest",
} as const

export type UserRole = (typeof ROLES)[keyof typeof ROLES]

// Role permissions
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ["manage_notaries", "approve_notaries", "view_all_notaries", "edit_settings"],
  [ROLES.NOTARY]: ["edit_profile", "manage_appointments", "upload_documents"],
  [ROLES.CLIENT]: ["book_appointments", "view_notaries", "rate_notaries"],
  [ROLES.GUEST]: ["view_notaries"],
} as const

// Check if a user has a specific permission
export function hasPermission(userRole: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission as any) || false
}

// Check if a user has a specific role
export function hasRole(userRole: UserRole, role: UserRole): boolean {
  return userRole === role
}

// Check if a user is an admin
export function isAdmin(userRole: UserRole): boolean {
  return userRole === ROLES.ADMIN
}

// Check if a user is a notary
export function isNotary(userRole: UserRole): boolean {
  return userRole === ROLES.NOTARY
}
