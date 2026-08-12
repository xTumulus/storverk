/** Extracts an 11-character YouTube video ID from a full video URL, or null if it doesn't match. */
export function parseYoutubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
}
