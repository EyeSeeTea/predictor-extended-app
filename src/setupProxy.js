// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createProxyMiddleware } = require("http-proxy-middleware");

/* react-script automatically executes src/setupProxy.js on init. Tasks:

    - Proxy requests from /dhis2/xyz to $REACT_APP_DHIS2_BASE_URL/xyz. Reason: Avoid problems with
      CORS and cross-domain cookies, as the app connects only to the local development server.

    - Redirect paths in `redirectPaths` to the original DHIS2 URL. Reason: some apps, i.e. Pivot Table App,
      do not work through the proxy. Tipically, these links are rendered on iframed dashboards.
*/

const redirectPaths = ["/dhis-web-pivot", "/dhis-web-data-visualizer"];

const targetUrl = process.env.REACT_APP_DHIS2_BASE_URL;
const auth = process.env.REACT_APP_DHIS2_AUTH;

module.exports = function (app) {
    if (!targetUrl) {
        console.error(`Set ${envVarName} to base DHIS2 URL`);
        process.exit(1);
    }

    const proxy = createProxyMiddleware({
        target: targetUrl,
        logLevel: "warn",
        changeOrigin: true,
        pathRewrite: { "^/dhis2/": "/" },
        auth,
        onProxyReq: function (proxyReq, req, res) {
            const { path } = proxyReq;
            const shouldRedirect = redirectPaths.some(redirectPath => path.startsWith(redirectPath));

            if (shouldRedirect) {
                const newUrl = targetUrl.replace(/\/$/, "") + path;
                res.location(newUrl);
                res.sendStatus(302);
            }
        },
    });

    app.use(["/dhis2"], proxy);
};
