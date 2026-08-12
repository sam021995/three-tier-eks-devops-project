const { createProxyMiddleware } = require("http-proxy-middleware");

// CRA's dev server only supports one proxy target via the simple "proxy"
// field in package.json - now that there are two backend services, auth
// requests need to go to auth-service while everything else under /api
// still goes to employee-service.
//
// Using pathFilter (not app.use("/api/auth", ...)) is deliberate: Express's
// own app.use(path, ...) strips that path prefix from the URL before the
// proxy ever sees it, which would forward "/health" instead of
// "/api/auth/health" and break every route. pathFilter only decides
// whether this middleware handles the request - it leaves the URL alone.
// Order matters: the more specific /api/auth filter must be registered
// before the general /api filter.
module.exports = function (app) {
  app.use(
    createProxyMiddleware({
      pathFilter: "/api/auth",
      target: "http://localhost:8090",
      changeOrigin: true
    })
  );
  app.use(
    createProxyMiddleware({
      pathFilter: "/api",
      target: "http://localhost:8080",
      changeOrigin: true
    })
  );
};
