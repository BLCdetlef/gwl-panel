import http from "node:http";
import path from "node:path";
import { promises as fs } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const host = "127.0.0.1";
const port = 4173;
const manifestPath = path.join(projectRoot, "data", "blc", "curve-approvals-v1.json");
const exportPath = path.join(projectRoot, "data", "blc", "blc-curve-export-v1.json");
const allowedOrigins = new Set([`http://localhost:${port}`, `http://${host}:${port}`]);
const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"]
]);

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(`${JSON.stringify(payload)}\n`);
}

async function run(command, args) {
  return execFileAsync(command, args, { cwd: projectRoot, windowsHide: true, maxBuffer: 10 * 1024 * 1024 });
}

async function readRequestJson(request) {
  const chunks = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > 1024 * 1024) throw new Error("Freigabemanifest ist zu groß.");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function publishApprovals(request, response) {
  if (!allowedOrigins.has(request.headers.origin || "")) {
    sendJson(response, 403, { error: "Veröffentlichung ist nur aus dem lokalen GWL-Editor erlaubt." });
    return;
  }

  const previousManifest = await fs.readFile(manifestPath);
  const previousExport = await fs.readFile(exportPath);
  let filesChanged = false;
  try {
    const manifest = await readRequestJson(request);
    await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    filesChanged = true;

    await run(process.execPath, ["scripts/validate-blc-curve-approvals.mjs"]);
    await run(process.execPath, ["scripts/build-blc-curve-export.mjs"]);
    await run(process.execPath, ["scripts/verify-blc-curve-export.mjs"]);

    const stagedBefore = await run("git", ["diff", "--cached", "--name-only"]);
    if (stagedBefore.stdout.trim()) throw new Error("Es gibt bereits vorgemerkte Git-Änderungen. Bitte diese zuerst committen oder aus dem Index entfernen.");

    await run("git", ["add", "--", "data/blc/curve-approvals-v1.json", "data/blc/blc-curve-export-v1.json"]);
    try {
      await run("git", ["diff", "--cached", "--quiet"]);
      sendJson(response, 200, { message: "Freigaben waren bereits vollständig veröffentlicht." });
      return;
    } catch (error) {
      if (error.code !== 1) throw error;
    }

    await run("git", ["commit", "-m", "Publish BLC curve approvals"]);
    const branch = (await run("git", ["branch", "--show-current"])).stdout.trim();
    if (!branch) throw new Error("Kein veröffentlichbarer Git-Branch aktiv.");
    await run("git", ["push", "origin", branch]);

    const commit = (await run("git", ["rev-parse", "--short", "HEAD"])).stdout.trim();
    sendJson(response, 200, { message: `Freigaben validiert, exportiert und gepusht · Commit ${commit}.` });
  } catch (error) {
    if (filesChanged) {
      await fs.writeFile(manifestPath, previousManifest);
      await fs.writeFile(exportPath, previousExport);
      await run("git", ["reset", "--quiet", "--", "data/blc/curve-approvals-v1.json", "data/blc/blc-curve-export-v1.json"]).catch(() => {});
    }
    sendJson(response, 500, { error: String(error.stderr || error.message || error).trim() });
  }
}

async function serveFile(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host || `${host}:${port}`}`);
  const relativePath = requestUrl.pathname === "/" ? "index.html" : decodeURIComponent(requestUrl.pathname.slice(1));
  const topLevelPath = relativePath.split(/[\\/]/, 1)[0];
  if (topLevelPath.startsWith(".") || topLevelPath === "scripts" || topLevelPath === "docs") {
    response.writeHead(403).end("Forbidden");
    return;
  }
  const filePath = path.resolve(projectRoot, relativePath);
  if (filePath !== projectRoot && !filePath.startsWith(`${projectRoot}${path.sep}`)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  try {
    const body = await fs.readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes.get(path.extname(filePath).toLowerCase()) || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(body);
  } catch (error) {
    response.writeHead(error.code === "ENOENT" ? 404 : 500).end(error.code === "ENOENT" ? "Not found" : "Server error");
  }
}

const server = http.createServer(async (request, response) => {
  if (request.method === "POST" && request.url === "/api/blc/publish") {
    await publishApprovals(request, response);
    return;
  }
  if (request.method === "GET" || request.method === "HEAD") {
    await serveFile(request, response);
    return;
  }
  response.writeHead(405, { Allow: "GET, HEAD, POST" }).end("Method not allowed");
});

server.listen(port, host, () => {
  console.log(`GWL-Redaktionsserver läuft auf http://localhost:${port}`);
  console.log("Beenden mit Strg+C.");
});
