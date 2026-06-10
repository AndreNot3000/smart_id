// Helpers for reading and validating the signed-in session.
//
// Tokens live in sessionStorage, which is per-tab. However, when a tab is
// opened FROM another tab (link, "open in new tab", duplicate tab), the browser
// COPIES the opener's sessionStorage into the new tab. That means a tab can
// start life holding a different user's token than the one you intend to use
// there. The role guard below catches that case so a dashboard never renders
// another account's data.

export type UserType = "student" | "lecturer" | "admin";

/** Decode the (untrusted) JWT payload purely to read routing info like role. */
function decodeTokenPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof atob !== "undefined"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("binary");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** The role encoded in the current access token, or null if absent/invalid. */
export function getTokenUserType(): UserType | null {
  if (typeof window === "undefined") return null;
  const token = sessionStorage.getItem("accessToken");
  if (!token) return null;
  const payload = decodeTokenPayload(token);
  const role = payload?.userType;
  return role === "student" || role === "lecturer" || role === "admin"
    ? role
    : null;
}

/** Wipe all auth state for the current tab. */
export function clearSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("user");
}

/**
 * Ensure the current tab's token belongs to `expected`. If there is no token,
 * or the token is for a different role, the session is cleared and the caller
 * is sent to /login. Returns true only when the tab is allowed to continue.
 */
export function enforceRole(
  expected: UserType,
  router: { push: (path: string) => void }
): boolean {
  if (typeof window === "undefined") return false;
  const token = sessionStorage.getItem("accessToken");
  if (!token) {
    router.push("/login");
    return false;
  }
  const role = getTokenUserType();
  if (role !== expected) {
    clearSession();
    router.push("/login");
    return false;
  }
  return true;
}
