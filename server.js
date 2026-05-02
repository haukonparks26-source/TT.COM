const http = require("http");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const host = "127.0.0.1";
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".zip": "application/zip",
  ".md": "text/markdown; charset=utf-8"
};

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${host}:${port}`);
  const requestPath = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1));
  const file = path.resolve(root, requestPath);

  if (!file.startsWith(root + path.sep)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(file, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    const extension = path.extname(file);
    const headers = {
      "Content-Type": types[extension] || "application/octet-stream"
    };

    if (extension === ".zip") {
      headers["Content-Disposition"] = `attachment; filename=${path.basename(file)}`;
      headers["Content-Length"] = data.length;
    }

    response.writeHead(200, headers);
    response.end(data);
  });
});

server.listen(port, host, () => {
  console.log(`TorqueTune running at http://${host}:${port}`);
});
