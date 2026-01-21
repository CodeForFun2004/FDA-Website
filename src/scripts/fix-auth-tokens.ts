// src/scripts/fix-auth-tokens.ts
/**
 * Quick fix script for authentication token issues
 * Run this in browser console to clear old tokens
 */

export function fixAuthTokens() {
  console.log('🔧 [Auth Fix] Starting token cleanup...');
  console.log('');

  // Step 1: Check current state
  console.log('📊 Step 1/3: Checking current state...');
  const authData = localStorage.getItem('fda_auth');

  if (!authData) {
    console.log('✅ No auth data found - nothing to clean');
    return;
  }

  try {
    const parsed = JSON.parse(authData);
    const state = parsed.state || {};

    console.log('Current user:', state.user?.email || 'None');
    console.log('Has access token:', !!state.accessToken);
    console.log('Has refresh token:', !!state.refreshToken);
    console.log('Expires at:', state.expiresAt);

    if (state.expiresAt) {
      const expiry = new Date(state.expiresAt).getTime();
      const now = Date.now();
      const isExpired = now >= expiry;
      const minutesRemaining = Math.floor((expiry - now) / 1000 / 60);

      console.log('Is expired:', isExpired);
      console.log('Minutes remaining:', minutesRemaining);

      if (isExpired) {
        console.log('⚠️ Token is expired!');
      }
    }

    console.log('');
  } catch (error) {
    console.error('❌ Error parsing auth data:', error);
  }

  // Step 2: Clear old data
  console.log('🧹 Step 2/3: Clearing old auth data...');
  localStorage.removeItem('fda_auth');

  // Clear any other auth-related keys
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('auth') || key.includes('token'))) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
    console.log('Removed:', key);
  });

  console.log('✅ Cleared', keysToRemove.length + 1, 'items from localStorage');
  console.log('');

  // Step 3: Next steps
  console.log('✅ Step 3/3: Cleanup complete!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Refresh the page (or run: location.reload())');
  console.log('2. Login again with your credentials');
  console.log('3. Your tokens will now be managed correctly!');
  console.log('');
  console.log(
    '💡 Tip: Add useAuthRefresh() hook to your layout for automatic token refresh'
  );
}

// Make it globally available in browser console
if (typeof window !== 'undefined') {
  (window as any).fixAuthTokens = fixAuthTokens;
  console.log('🔧 Auth fix loaded! Run: fixAuthTokens()');
}

export default fixAuthTokens;
