/** Convert "HH:MM" (24h) to minutes since midnight. */
export function timeToMinutes(time: string): number {
  const parts = time.split(':').map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

const OVERNIGHT_END_CUTOFF = 6 * 60; // 06:00

/** Validate end is after start; allow overnight (e.g. 23:30 → 01:00). */
export function validateScheduleTimeRange(
  startTime: string,
  endTime: string,
): string | null {
  if (startTime === endTime) {
    return 'Start time and end time cannot be the same';
  }

  const startM = timeToMinutes(startTime);
  const endM = timeToMinutes(endTime);

  if (endM <= startM) {
    if (endM <= OVERNIGHT_END_CUTOFF) {
      return null;
    }
    return 'End time must be after start time';
  }

  return null;
}

/** Reject past dates or a start time that has already passed today. */
export function validateScheduleNotInPast(
  date: string,
  startTime: string,
  now: Date = new Date(),
): string | null {
  const todayStr = now.toISOString().split('T')[0]!;
  if (date < todayStr) {
    return 'Cannot schedule a class on a past date';
  }
  if (date === todayStr && timeToMinutes(startTime) <= now.getHours() * 60 + now.getMinutes()) {
    return 'Cannot schedule a class for a time that has already passed today';
  }
  return null;
}
