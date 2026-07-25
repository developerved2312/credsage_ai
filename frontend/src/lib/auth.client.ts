import { createAuthClient } from 'better-auth/react';

// Derive the backend origin from VITE_API_URL by stripping the trailing /api path.
// e.g. "http://localhost:3000/api" → "http://localhost:3000"
// Falls back to the bare backend origin if the env var is not set.
function getAuthBaseURL(): string {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) return 'http://localhost:3000';
  try {
    const url = new URL(apiUrl);
    // Remove trailing /api segment if present
    url.pathname = url.pathname.replace(/\/api\/?$/, '') || '/';
    return url.origin;
  } catch {
    return 'http://localhost:3000';
  }
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  $Infer,
} = authClient;
