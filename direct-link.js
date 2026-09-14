(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.GWL_DIRECT_LINKS = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function readRequest(search) {
    const params = new URLSearchParams(search || "");
    return {
      boundaryId: params.get("boundary"),
      itemId: params.get("item"),
      curveId: params.get("curve")
    };
  }

  function resolve(boundaries, request) {
    const { boundaryId, itemId } = request || {};
    if (!boundaryId && !itemId && !request?.curveId) return { status: "none" };
    if (!boundaryId || !itemId) return { status: "incomplete", boundaryId, itemId };
    const boundary = (boundaries || []).find(candidate => candidate.id === boundaryId);
    if (!boundary) return { status: "unknown_boundary", boundaryId, itemId };
    const item = (boundary.items || []).find(candidate => candidate.id === itemId && candidate.archived !== true);
    if (!item) return { status: "unknown_item", boundary, boundaryId, itemId };
    return { status: "ok", boundary, item, boundaryId, itemId, curveId: request.curveId };
  }

  function select(resolution, handlers) {
    if (resolution?.status !== "ok") return false;
    handlers.selectBoundary(resolution.boundaryId);
    handlers.selectItem(resolution.boundaryId, resolution.itemId);
    return true;
  }

  return { readRequest, resolve, select };
});
