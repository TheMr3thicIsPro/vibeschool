/**
 * YouTube IFrame API Loader Utility
 * Ensures safe, single-load initialization of YouTube's iframe API
 */

// Extend window interface
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    __ytPromise?: Promise<void>;
  }
}

// Global promise to prevent duplicate API loading
let ytApiPromise: Promise<void> | null = null;

/**
 * Load the YouTube IFrame API safely
 * @returns Promise<void> that resolves when the API is ready
 */
export function loadYouTubeIFrameAPI(timeoutMs = 15000): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  // already ready
  if (window.YT?.Player) return Promise.resolve();

  // already loading (return same promise)
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise<void>((resolve, reject) => {
    let timeout: any = null;

    const done = () => {
      if (timeout) clearTimeout(timeout);
      resolve();
    };

    // if script already loaded but YT not ready yet, poll briefly
    const quickPoll = () => {
      let tries = 0;
      const t = setInterval(() => {
        tries++;
        if (window.YT?.Player) {
          clearInterval(t);
          done();
        } else if (tries > 200) { // ~10s if 50ms interval
          clearInterval(t);
          reject(new Error("YT API loaded but Player not available"));
        }
      }, 50);
    };

    // set callback BEFORE injecting script
    window.onYouTubeIframeAPIReady = () => done();

    // inject only once
    const existing = document.querySelector('script[data-yt-iframe-api="true"]') as HTMLScriptElement | null;
    if (!existing) {
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      s.dataset.ytIframeApi = "true";
      s.onerror = () => reject(new Error("Failed to load YouTube IFrame API script"));
      document.body.appendChild(s);
    } else {
      // script tag exists already, just wait for Player
      quickPoll();
    }

    // hard timeout
    timeout = setTimeout(() => {
      reject(new Error(`YT API load timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  }).catch((err) => {
    // allow retries if it failed
    ytApiPromise = null;
    throw err;
  });

  return ytApiPromise;
}

/**
 * Destroy a YouTube player instance safely
 * @param player - YouTube player instance
 */
export const destroyPlayer = (player: any): void => {
  if (player && typeof player.destroy === 'function') {
    try {
      console.log('YT: destroying player');
      player.destroy();
    } catch (error) {
      console.warn('YT: Error destroying player:', error);
    }
  }
};