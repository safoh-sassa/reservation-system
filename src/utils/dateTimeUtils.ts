/**
 * Formats a date/time range with smart date display logic.
 * If start and end dates are the same, only shows the date once.
 * If dates are different, shows both dates for clarity.
 *
 * @param startTime - ISO string of start time
 * @param endTime - ISO string of end time
 * @returns Formatted date/time range string
 *
 * @example
 * // Same date: "27-07-2025, 15:36:00 - 16:41:00"
 * // Different dates: "27-07-2025, 22:00:00 - 28-07-2025, 06:00:00"
 */
export function formatDateTimeRange(
  startTime: string,
  endTime: string
): string {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  const startDateStr = startDate
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    })
    .replace(/\//g, "-");

  const endDateStr = endDate
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    })
    .replace(/\//g, "-");

  const startTimeStr = startDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  });

  const endTimeStr = endDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  });

  // If same date, show: "27-07-2025, 15:36:00 - 16:41:00"
  if (startDateStr === endDateStr) {
    return `${startDateStr}, ${startTimeStr} - ${endTimeStr}`;
  }

  // If different dates, show: "27-07-2025, 15:36:00 - 28-07-2025, 16:41:00"
  return `${startDateStr}, ${startTimeStr} - ${endDateStr}, ${endTimeStr}`;
}
