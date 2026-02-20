export function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export function getDuration(startStr: string, endStr: string) {
  const start = new Date(startStr).getTime();
  const end = new Date(endStr).getTime();

  const diffMinutes = Math.round((end - start) / (1000 * 60));

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours && minutes) return `${hours}h ${minutes}m`;
  if (hours) return `${hours}h`;
  return `${minutes}m`;
}
