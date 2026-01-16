// src/features/stations/utils/auth.ts

/**
 * Get access token from localStorage
 * Token is stored in 'fda_auth' key with Zustand persist structure
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    console.log('🔒 Auth: Running on server, no token available');
    return null;
  }

  try {
    const storageVal = localStorage.getItem('fda_auth');
    console.log(
      '🔍 Auth: localStorage fda_auth:',
      storageVal ? 'exists' : 'not found'
    );

    if (!storageVal) return null;

    const parsed = JSON.parse(storageVal);

    // Log the full structure to help debug
    console.log(
      '📋 Auth: Full parsed structure:',
      JSON.stringify(parsed, null, 2)
    );
    console.log(
      '📋 Auth: Available keys in state:',
      Object.keys(parsed?.state || {})
    );

    // Try different possible token locations
    const possibleTokens = {
      accessToken: parsed?.state?.accessToken,
      access_token: parsed?.state?.access_token,
      token: parsed?.state?.token,
      jwt: parsed?.state?.jwt,
      authToken: parsed?.state?.authToken
    };

    console.log('🔑 Auth: Possible token fields:', possibleTokens);

    // Zustand persist structure: { state: { accessToken: ... }, version: ... }
    const token = parsed?.state?.accessToken ?? null;
    console.log('✅ Auth: Token retrieved:', token ? 'SUCCESS' : 'FAILED');
    console.log('📏 Auth: Token length:', token?.length);
    console.log('🎯 Auth: Token type:', typeof token);

    return token;
  } catch (error) {
    console.error('❌ Auth: Error parsing fda_auth from localStorage', error);
    return null;
  }
}
