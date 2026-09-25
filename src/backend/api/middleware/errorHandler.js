/**
 * Kai RegAI — Global Error Handler
 * Phase: P13 — Production Backend & Commercial Authority
 * 
 * Enforces Invariant:
 * - Never leaks stack traces, filesystem paths, SQL fragments, or database internals to client
 * - Uniform error envelope: { error: { code, message, requestId } }
 */

export function sendError(res, err, requestId = null, statusCode = null) {
  let status = statusCode;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected server error occurred';

  const rawMsg = err?.message || String(err);

  if (!status) {
    if (rawMsg.startsWith('400')) status = 400;
    else if (rawMsg.startsWith('401')) status = 401;
    else if (rawMsg.startsWith('403')) status = 403;
    else if (rawMsg.startsWith('404')) status = 404;
    else if (rawMsg.startsWith('409')) status = 409;
    else if (rawMsg.startsWith('413')) status = 413;
    else if (rawMsg.startsWith('429')) status = 429;
    else status = 500;
  }

  if (status === 400) {
    code = 'BAD_REQUEST';
    message = rawMsg.replace(/^400\s*(Bad Request:?)?\s*/i, '') || 'Invalid request payload';
  } else if (status === 401) {
    code = 'UNAUTHORIZED';
    message = rawMsg.replace(/^401\s*(Unauthorized:?)?\s*/i, '') || 'Authentication required';
  } else if (status === 403) {
    code = 'FORBIDDEN';
    message = rawMsg.replace(/^403\s*(Forbidden:?)?\s*/i, '') || 'Access denied';
  } else if (status === 404) {
    code = 'NOT_FOUND';
    message = rawMsg.replace(/^404\s*(Not Found:?)?\s*/i, '') || 'Resource not found';
  } else if (status === 409) {
    code = 'CONFLICT';
    message = rawMsg.replace(/^409\s*(Conflict:?)?\s*/i, '') || 'Resource conflict';
  } else if (status === 413) {
    code = 'PAYLOAD_TOO_LARGE';
    message = rawMsg.replace(/^413\s*(Payload Too Large:?)?\s*/i, '') || 'Payload exceeds maximum limit';
  } else if (status === 429) {
    code = 'RATE_LIMIT_EXCEEDED';
    message = rawMsg.replace(/^429\s*/i, '') || 'Rate limit exceeded';
  } else {
    code = 'INTERNAL_SERVER_ERROR';
    // Protect against leaking SQL or internal details
    message = 'Internal server error. Please try again later.';
  }

  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: {
      code,
      message,
      requestId: requestId || null
    }
  }));
}
