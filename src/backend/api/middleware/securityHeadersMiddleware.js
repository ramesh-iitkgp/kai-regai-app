/**
 * Kai RegAI — Security Headers Middleware
 * Phase: P17 — Production Infrastructure & Deployment Certification
 * 
 * Enforces production HTTP security headers adhering to OWASP / DevSecOps standards:
 * - Content-Security-Policy (CSP)
 * - HTTP Strict Transport Security (HSTS)
 * - X-Content-Type-Options (MIME-sniffing prevention)
 * - X-Frame-Options (Clickjacking defense)
 * - Referrer-Policy
 * - Permissions-Policy (Feature policy hardening)
 */

export function securityHeadersMiddleware(req, res, next) {
  // 1. Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none';"
  );

  // 2. Strict Transport Security (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // 3. MIME Sniffing Protection
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // 4. Clickjacking Prevention
  res.setHeader('X-Frame-Options', 'DENY');

  // 5. Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 6. Permissions Policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (next) {
    next();
  }
}
