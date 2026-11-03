/**
 * Only allow post-sign-in destinations that belong to the account area.
 * This blocks open redirects such as `//evil.example` or `/api/auth/logout`.
 */
const allowedPrefixes = ["/dashboard", "/admin"];

export function safeNextPath(value: string | null | undefined) {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.includes("\\") || value.includes("\n") || value.includes("\r")) return null;

  let pathname: string;
  try {
    pathname = new URL(value, "https://wrightyard.local").pathname;
  } catch {
    return null;
  }

  return allowedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
    ? pathname
    : null;
}
