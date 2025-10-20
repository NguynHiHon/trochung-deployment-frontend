// Small helper to decode JWT payload robustly
export function decodeJwt(token) {
  if (!token) return null;
  try {
    // Try to use jwt-decode if available (works whether it's default or named export)
    try {
      // require is used here to avoid build-time ESM import issues
      let jwtDecode = require('jwt-decode');
      jwtDecode = jwtDecode && jwtDecode.default ? jwtDecode.default : jwtDecode;
      if (typeof jwtDecode === 'function') return jwtDecode(token);
    } catch (e) {
      // fallthrough to manual decode
    }

    // Fallback: manual base64 decode of payload
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(payload).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}
