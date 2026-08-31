export const BLC_CURVE_ROLES = Object.freeze(["core", "deep_dive"]);

const allowedRoles = new Set(BLC_CURVE_ROLES);

export function requireBlcCurveRole(entry, context = "BLC-Kurve") {
  if (!entry || typeof entry.curveRole !== "string" || !entry.curveRole) {
    throw new Error(`${context}: curveRole fehlt; erforderlich ist core oder deep_dive.`);
  }
  if (!allowedRoles.has(entry.curveRole)) {
    throw new Error(`${context}: unbekannte curveRole ${entry.curveRole}; zulässig sind core und deep_dive.`);
  }
  return entry.curveRole;
}
