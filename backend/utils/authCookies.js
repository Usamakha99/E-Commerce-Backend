/**
 * HttpOnly cookies for JWT access + refresh tokens.
 * Set COOKIE_SECURE=true in production behind HTTPS. For local HTTP, keep false.
 * If frontend and API use different subdomains, set COOKIE_SAME_SITE=None and COOKIE_SECURE=true,
 * and set COOKIE_DOMAIN=.yourdomain.com
 */

const ACCESS_NAME = process.env.AUTH_COOKIE_ACCESS_NAME || "accessToken";
const REFRESH_NAME = process.env.AUTH_COOKIE_REFRESH_NAME || "refreshToken";

function baseCookieOptions() {
  const sameSiteRaw = (process.env.COOKIE_SAME_SITE || "Lax").trim();
  const sameSite =
    sameSiteRaw === "None" || sameSiteRaw === "Strict" || sameSiteRaw === "Lax"
      ? sameSiteRaw
      : "Lax";
  const secure =
    process.env.COOKIE_SECURE === "true" ||
    process.env.COOKIE_SECURE === "1";
  const domain = (process.env.COOKIE_DOMAIN || "").trim() || undefined;
  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    ...(domain ? { domain } : {}),
  };
}

function setAuthCookies(res, { accessToken, refreshToken }) {
  const base = baseCookieOptions();
  // Match JWT exp: access 15m, refresh 7d (see userController generateTokens)
  res.cookie(ACCESS_NAME, accessToken, {
    ...base,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie(REFRESH_NAME, refreshToken, {
    ...base,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookies(res) {
  const base = baseCookieOptions();
  res.clearCookie(ACCESS_NAME, { path: base.path, domain: base.domain });
  res.clearCookie(REFRESH_NAME, { path: base.path, domain: base.domain });
}

function getAccessTokenFromCookies(req) {
  return req.cookies?.[ACCESS_NAME] || null;
}

function getRefreshTokenFromCookies(req) {
  return req.cookies?.[REFRESH_NAME] || null;
}

module.exports = {
  setAuthCookies,
  clearAuthCookies,
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
  ACCESS_NAME,
  REFRESH_NAME,
};
