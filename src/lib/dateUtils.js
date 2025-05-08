
export function formatUnixTimestamp(timestamp) {
  if (timestamp === null || timestamp === undefined) return 'N/A';
  try {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString(); // Adjust format as needed, e.g., toLocaleTimeString, toLocaleDateString
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return 'Invalid Date';
  }
}
  