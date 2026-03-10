// Zero-dependency static server for the built frontend (dist/)
// Run with: node server.cjs
const http = require("http");
const path = require("path");
const fs = require("fs");

const PORT = process.env.FRONTEND_PORT || 5001;
const distPath = path.join(__dirname, "dist");
const indexPath = path.join(distPath, "index.html");

if (!fs.existsSync(indexPath)) {
  console.error(
    "❌ frontend/dist not found. Build first: cd frontend && npm run build"
  );
  process.exit(1);
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": contentType });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  try {
    // normalize path and prevent directory traversal
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");

    let filePath = path.join(distPath, safePath);

    // If directory, serve index.html
    if (safePath.endsWith("/")) filePath = path.join(filePath, "index.html");

    // Serve file if exists, otherwise SPA fallback to index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return sendFile(res, filePath);
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    fs.createReadStream(indexPath).pipe(res);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(err?.message || "Server error");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Frontend (dist) server running on port ${PORT}`);
});


