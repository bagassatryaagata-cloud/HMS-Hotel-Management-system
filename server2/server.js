
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = 3002;
const PUBLIC_DIR = path.resolve(__dirname, "..");

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const requestedPath =
    pathname === "/" ? "index.html" : pathname.slice(1);

  const filePath = path.resolve(PUBLIC_DIR, requestedPath);

  if (!filePath.startsWith(PUBLIC_DIR + path.sep) &&
      filePath !== path.join(PUBLIC_DIR, "index.html")) {
    res.writeHead(403);
    return res.end("403 Forbidden");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("404 - File tidak ditemukan");
    }

    const ext = path.extname(filePath);
    const types = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml"
    };

    res.writeHead(200, {
      "Content-Type": types[ext] || "application/octet-stream"
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server 2 berjalan: http://localhost:${PORT}`);
});


