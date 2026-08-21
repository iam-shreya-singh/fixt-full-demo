const DEMO_OWNER_ID = 'clerk_demo_owner'

/**
 * Clerk integration boundary for owner-scoped server actions.
 * Replace the environment fallback with Clerk's auth().userId once Clerk is connected.
 */
export function getOwnerId(): string {
  return process.env.FIXT_OWNER_ID ?? DEMO_OWNER_ID
}

export function isDemoOwner(): boolean {
  return getOwnerId() === DEMO_OWNER_ID
}
