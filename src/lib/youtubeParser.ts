/**
 * Parse YouTube URL or ID to extract video ID and create embed URL
 * @param input - Raw YouTube URL or video ID
 * @returns Object containing videoId, embedUrl, and optional error
 */
export function parseYouTube(input: string): { 
  videoId: string | null; 
  embedUrl: string | null; 
  error?: string 
} {
  if (!input || typeof input !== 'string') {
    return {
      videoId: null,
      embedUrl: null,
      error: 'Input is required and must be a string'
    };
  }

  // Clean the input by trimming whitespace
  const cleanedInput = input.trim();

  // Regular expression to validate YouTube video ID format (11 alphanumeric chars including hyphens and underscores)
  const videoIdRegex = /^[a-zA-Z0-9_-]{11}$/;

  // If input is exactly 11 characters and matches YouTube ID format, treat as raw ID
  if (cleanedInput.length === 11 && videoIdRegex.test(cleanedInput)) {
    return {
      videoId: cleanedInput,
      embedUrl: `https://www.youtube.com/embed/${cleanedInput}`,
      error: undefined
    };
  }

  // Regular expression to match various YouTube URL formats
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;

  const match = cleanedInput.match(youtubeRegex);

  if (match && match[1]) {
    const videoId = match[1];
    return {
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      error: undefined
    };
  }

  // Check for YouTube Shorts format
  const shortsRegex = /youtube\.com\/shorts\/([^"&?\/\s]{11})/i;
  const shortsMatch = cleanedInput.match(shortsRegex);

  if (shortsMatch && shortsMatch[1]) {
    const videoId = shortsMatch[1];
    return {
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      error: undefined
    };
  }

  // If no match found, return error
  return {
    videoId: null,
    embedUrl: null,
    error: 'Invalid YouTube URL or video ID. Please provide a valid YouTube URL or 11-character video ID.'
  };
}