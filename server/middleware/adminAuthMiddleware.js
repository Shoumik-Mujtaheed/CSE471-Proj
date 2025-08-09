// server/middleware/adminAuthMiddleware.js
// DEV-ONLY: disable admin auth for now
export default function adminAuthMiddleware(_req, _res, next) {
  // no checks, just continue
  return next();
}
