/**
 * Returns today's date in YYYY-MM-DD format using the user's LOCAL timezone.
 * This is critical — toISOString() returns UTC which causes date mismatches
 * for users in positive timezone offsets (e.g. UTC+2 at midnight shows previous day).
 */
export function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
