// Empty NEXT_PUBLIC_API_URL means "use the same origin as the page" -- this
// activates the Next.js /api/* proxy in next.config.ts and avoids CORS entirely.
// Trailing slashes are stripped so a pasted value like
// "https://host.fly.dev/" never produces a double-slash "//api/..." 404.
const ENV_API_URL =
  process.env.NEXT_PUBLIC_API_URL !== undefined &&
  process.env.NEXT_PUBLIC_API_URL !== ''
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '')
    : '';

// localStorage key used to persist a runtime API base override per device.
// This lets you point the frontend at a fresh Cloudflare/ngrok tunnel URL
// without restarting `next dev` or rebuilding. Survives across logins.
export const API_BASE_OVERRIDE_KEY = '__campusApiBase';
const API_BASE_QUERY_PARAM = 'apiBase';

function readOverride(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const fromStorage = window.localStorage.getItem(API_BASE_OVERRIDE_KEY);
    if (fromStorage && /^https?:\/\//.test(fromStorage)) {
      return fromStorage.replace(/\/+$/, '');
    }
  } catch {
    // localStorage may be disabled (private mode, etc.)
  }
  return null;
}

// Capture ?apiBase=... from the URL and persist it before we read the override.
// Doing this synchronously at module load means every fetch() afterwards sees
// the new value. The query param is then stripped from the visible URL.
if (typeof window !== 'undefined') {
  try {
    const params = new URLSearchParams(window.location.search);
    const override = params.get(API_BASE_QUERY_PARAM);
    if (override) {
      if (override.toLowerCase() === 'reset' || override === '') {
        window.localStorage.removeItem(API_BASE_OVERRIDE_KEY);
      } else if (/^https?:\/\//.test(override)) {
        window.localStorage.setItem(API_BASE_OVERRIDE_KEY, override.replace(/\/+$/, ''));
      }
      params.delete(API_BASE_QUERY_PARAM);
      const cleaned =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : '') +
        window.location.hash;
      window.history.replaceState({}, document.title, cleaned);
    }
  } catch {
    // ignore
  }
}

export const API_BASE_URL: string = readOverride() ?? ENV_API_URL;

export const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

if (typeof window !== 'undefined') {
  const w = window as unknown as Window & {
    __apiFetchPatched?: boolean;
    setApiBase?: (url: string | null) => void;
  };

  // Tiny console helper so you can also do `setApiBase('https://...')` in devtools.
  if (!w.setApiBase) {
    w.setApiBase = (url: string | null) => {
      if (!url) {
        window.localStorage.removeItem(API_BASE_OVERRIDE_KEY);
        console.info('[Campus ID] API base override cleared. Reload to apply.');
        return;
      }
      window.localStorage.setItem(API_BASE_OVERRIDE_KEY, url.replace(/\/+$/, ''));
      console.info(`[Campus ID] API base set to ${url}. Reload to apply.`);
    };
  }

  if (!w.__apiFetchPatched) {
    const needsNgrokBypass = API_BASE_URL.includes('ngrok');

    if (needsNgrokBypass) {
      const originalFetch = window.fetch.bind(window);

      window.fetch = Object.assign(
        (input: RequestInfo | URL, init: RequestInit = {}) => {
          const url =
            typeof input === 'string'
              ? input
              : input instanceof URL
                ? input.toString()
                : input.url;

          if (url.includes('ngrok')) {
            const headers = new Headers(init.headers as HeadersInit | undefined);
            if (!headers.has('ngrok-skip-browser-warning')) {
              headers.set('ngrok-skip-browser-warning', 'true');
            }
            init = { ...init, headers };
          }

          return originalFetch(input, init);
        },
        originalFetch,
      );
    }

    if (readOverride()) {
      console.info(
        `[Campus ID] Using runtime API base override: ${API_BASE_URL}. ` +
          `Clear with setApiBase(null) or visit ?apiBase=reset.`,
      );
    }

    // Dev-time sanity check: warn if the page is served from a public host
    // but the API points at a host mobile networks commonly cannot reach.
    // Same-origin / relative URLs (empty API_BASE_URL) are always fine.
    if (API_BASE_URL) {
      try {
        const pageHost = window.location.hostname;
        const apiHost = new URL(API_BASE_URL).hostname;
        const pageIsPublic =
          !pageHost.includes('localhost') && pageHost !== '127.0.0.1';
        const apiIsLocalOrNgrokFree =
          apiHost === 'localhost' ||
          apiHost === '127.0.0.1' ||
          apiHost.endsWith('.ngrok-free.dev') ||
          apiHost.endsWith('.ngrok-free.app');

        if (pageIsPublic && apiIsLocalOrNgrokFree) {
          console.warn(
            `[Campus ID] Page is served from "${pageHost}" but the API URL is "${API_BASE_URL}". ` +
              `Mobile devices on cellular networks often cannot reach this. ` +
              `Either unset NEXT_PUBLIC_API_URL to use the same-origin proxy, ` +
              `or visit "?apiBase=https://your-tunnel.trycloudflare.com" once per device.`,
          );
        }
      } catch {
        // ignore URL parsing errors
      }
    }

    w.__apiFetchPatched = true;
  }
}
