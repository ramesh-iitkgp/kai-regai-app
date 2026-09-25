/**
 * Kai RegAI — Authentication Middleware
 * Phase: P13 — Production Backend & Commercial Authority
 */

export function createAuthMiddleware(authService) {
  return function authMiddleware(req, res, next, { required = true } = {}) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (required) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authorization token required in Bearer format',
            requestId: req.id || null
          }
        }));
        return;
      }
      return next();
    }

    const token = authHeader.substring(7).trim();
    try {
      const session = authService.validateSession(token);
      req.user = session.user;
      req.sessionId = session.sessionId;
      next();
    } catch (err) {
      if (required) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: {
            code: 'UNAUTHORIZED',
            message: err.message || 'Invalid or expired session token',
            requestId: req.id || null
          }
        }));
        return;
      }
      next();
    }
  };
}
