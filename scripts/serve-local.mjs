import http from "node:http";
import path from "node:path";
import { promises as fs } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const host = "127.0.0.1";
const port = Number(process.argv[2] || process.env.GWL_EDITOR_PORT || 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("GWL_EDITOR_PORT muss ein gültiger lokaler Port sein.");
const manifestPath = path.join(projectRoot, "data", "blc", "curve-approvals-v1.json");
const exportPath = path.join(projectRoot, "data", "blc", "blc-curve-export-v1.json");
const blcRoot = path.resolve(projectRoot, "..", "BLC26");
const blcImportRelativePath = "data/gwl/blc-curve-export-v1.json";
const blcImportPath = path.join(blcRoot, ...blcImportRelativePath.split("/"));
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

function sendProgress(response, payload) {
  response.write(`${JSON.stringify(payload)}\n`);
}

async function run(command, args, cwd = projectRoot) {
  return execFileAsync(command, args, { cwd, windowsHide: true, maxBuffer: 10 * 1024 * 1024 });
}

async function ensureCleanGitIndex(repositoryRoot, label) {
  const staged = await run("git", ["diff", "--cached", "--name-only"], repositoryRoot);
  if (staged.stdout.trim()) throw new Error(`${label}: Es gibt bereits vorgemerkte Git-Änderungen. Bitte diese zuerst committen oder aus dem Index entfernen.`);
}

async function commitAndPush(repositoryRoot, files, message) {
  await run("git", ["add", "--", ...files], repositoryRoot);
  try {
    await run("git", ["diff", "--cached", "--quiet"], repositoryRoot);
    return null;
  } catch (error) {
    if (error.code !== 1) throw error;
  }

  await run("git", ["commit", "-m", message], repositoryRoot);
  const branch = (await run("git", ["branch", "--show-current"], repositoryRoot)).stdout.trim();
  if (!branch) throw new Error(`${path.basename(repositoryRoot)}: Kein veröffentlichbarer Git-Branch aktiv.`);
  await run("git", ["push", "origin", branch], repositoryRoot);
  return (await run("git", ["rev-parse", "--short", "HEAD"], repositoryRoot)).stdout.trim();
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

  response.writeHead(200, {
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });

  const previousManifest = await fs.readFile(manifestPath);
  const previousExport = await fs.readFile(exportPath);
  let previousBlcImport;
  let startingGwlHead;
  let startingBlcHead;
  let activeStage = "prepare";
  try {
    sendProgress(response, { type: "progress", stage: activeStage, status: "running", message: "Repositories und Freigabemanifest werden vorgeprüft …" });
    previousBlcImport = await fs.readFile(blcImportPath);
    startingGwlHead = (await run("git", ["rev-parse", "HEAD"])).stdout.trim();
    startingBlcHead = (await run("git", ["rev-parse", "HEAD"], blcRoot)).stdout.trim();
    await ensureCleanGitIndex(projectRoot, "GWL");
    await ensureCleanGitIndex(blcRoot, "BLC26");

    const manifest = await readRequestJson(request);
    await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    sendProgress(response, { type: "progress", stage: activeStage, status: "complete", message: `Vorprüfung abgeschlossen · ${manifest.approvedCurves?.length || 0} Freigabe(n).` });

    activeStage = "gwl_validate";
    sendProgress(response, { type: "progress", stage: activeStage, status: "running", message: "GWL-Manifest wird validiert und der Export erzeugt …" });
    await run(process.execPath, ["scripts/validate-blc-curve-approvals.mjs"]);
    await run(process.execPath, ["scripts/build-blc-curve-export.mjs"]);
    await run(process.execPath, ["scripts/verify-blc-curve-export.mjs"]);
    sendProgress(response, { type: "progress", stage: activeStage, status: "complete", message: "GWL-Export und Integritätswert sind gültig." });

    activeStage = "gwl_publish";
    sendProgress(response, { type: "progress", stage: activeStage, status: "running", message: "GWL-Manifest und Export werden veröffentlicht …" });
    const gwlCommit = await commitAndPush(
      projectRoot,
      ["data/blc/curve-approvals-v1.json", "data/blc/blc-curve-export-v1.json"],
      "Publish BLC curve approvals"
    );
    sendProgress(response, { type: "progress", stage: activeStage, status: "complete", message: gwlCommit ? `GWL wurde gepusht · Commit ${gwlCommit}.` : "GWL war bereits aktuell." });

    activeStage = "blc_transfer";
    sendProgress(response, { type: "progress", stage: activeStage, status: "running", message: "Der verifizierte Export wird nach BLC26 übertragen …" });
    await fs.copyFile(exportPath, blcImportPath);
    sendProgress(response, { type: "progress", stage: activeStage, status: "complete", message: "Export wurde an BLC26 übergeben." });

    activeStage = "blc_validate";
    sendProgress(response, { type: "progress", stage: activeStage, status: "running", message: "BLC26 prüft Import, Integrität und Direktlink-IDs …" });
    await run(process.execPath, ["scripts/verify-gwl-import.mjs"], blcRoot);
    sendProgress(response, { type: "progress", stage: activeStage, status: "complete", message: "BLC-Import ist vollständig und gültig." });

    activeStage = "blc_publish";
    sendProgress(response, { type: "progress", stage: activeStage, status: "running", message: "Der BLC-Import wird veröffentlicht …" });
    const blcCommit = await commitAndPush(blcRoot, [blcImportRelativePath], "Update verified GWL curve import");
    sendProgress(response, { type: "progress", stage: activeStage, status: "complete", message: blcCommit ? `BLC26 wurde gepusht · Commit ${blcCommit}.` : "BLC26 war bereits aktuell." });

    const details = [gwlCommit ? `GWL ${gwlCommit}` : "GWL unverändert", blcCommit ? `BLC26 ${blcCommit}` : "BLC26 unverändert"];
    sendProgress(response, { type: "done", message: `Freigaben vollständig veröffentlicht · ${details.join(" · ")}.` });
    response.end();
  } catch (error) {
    const currentGwlHead = await run("git", ["rev-parse", "HEAD"]).then(result => result.stdout.trim()).catch(() => null);
    if (startingGwlHead && currentGwlHead === startingGwlHead) {
      await fs.writeFile(manifestPath, previousManifest);
      await fs.writeFile(exportPath, previousExport);
      await run("git", ["reset", "--quiet", "--", "data/blc/curve-approvals-v1.json", "data/blc/blc-curve-export-v1.json"]).catch(() => {});
    }
    const currentBlcHead = await run("git", ["rev-parse", "HEAD"], blcRoot).then(result => result.stdout.trim()).catch(() => null);
    if (previousBlcImport && startingBlcHead && currentBlcHead === startingBlcHead) {
      await fs.writeFile(blcImportPath, previousBlcImport);
      await run("git", ["reset", "--quiet", "--", blcImportRelativePath], blcRoot).catch(() => {});
    }
    sendProgress(response, { type: "error", stage: activeStage, status: "failed", error: String(error.stderr || error.message || error).trim() });
    response.end();
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
