/** Honorific prefix (Mr, Dr, Prof, …). Prefers `title`, falls back to legacy `role`. */
export function getLecturerHonorific(
  profile: { title?: string; role?: string } | null | undefined,
): string {
  if (!profile) return '';
  return (profile.title || profile.role || '').trim();
}

/** Builds a display name such as "Dr. John Doe". Adds a period when missing. */
export function formatLecturerDisplayName(
  profile: {
    title?: string;
    role?: string;
    firstName?: string;
    lastName?: string;
  } | null | undefined,
): string {
  if (!profile) return '';
  const honorific = getLecturerHonorific(profile);
  const name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
  if (!honorific) return name;
  const prefix = honorific.endsWith('.') ? honorific : `${honorific}.`;
  return `${prefix} ${name}`.trim();
}
