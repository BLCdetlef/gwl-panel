export const BLC_REFERENCE_ROLES = Object.freeze(["boundary"]);
export const BLC_REFERENCE_QUALIFIERS = Object.freeze(["exact", "approximate"]);
export const BLC_EXCEEDANCE_OPERATORS = Object.freeze([">", "<"]);

const allowedRoles = new Set(BLC_REFERENCE_ROLES);
const allowedQualifiers = new Set(BLC_REFERENCE_QUALIFIERS);
const allowedOperators = new Set(BLC_EXCEEDANCE_OPERATORS);

export function normalizeBlcReference(reference, { series, sourceIds, requirePilot = false } = {}) {
  if (!reference || typeof reference !== "object" || Array.isArray(reference)) {
    if (requirePilot) throw new Error(`${series?.id || "BLC-Kurve"}: Referenz fehlt.`);
    return undefined;
  }

  const hasPilotField = ["role", "qualifier", "exceedanceOperator"].some(field => field in reference);
  if (!requirePilot && !hasPilotField) return null;

  const context = series?.id || "BLC-Kurve";
  if (!reference.role) throw new Error(`${context}: reference.role fehlt.`);
  if (!allowedRoles.has(reference.role)) throw new Error(`${context}: unbekannte reference.role ${reference.role}.`);
  if (!reference.qualifier || !allowedQualifiers.has(reference.qualifier)) {
    throw new Error(`${context}: ungültiger reference.qualifier ${reference.qualifier || "–"}.`);
  }
  if (!reference.exceedanceOperator) throw new Error(`${context}: reference.exceedanceOperator fehlt.`);
  if (!allowedOperators.has(reference.exceedanceOperator)) {
    throw new Error(`${context}: unbekannter reference.exceedanceOperator ${reference.exceedanceOperator}.`);
  }
  if (!Number.isFinite(Number(reference.value))) throw new Error(`${context}: reference.value muss numerisch sein.`);
  if (typeof reference.unit !== "string" || reference.unit !== series?.unit) {
    throw new Error(`${context}: Referenzeinheit ${reference.unit || "–"} stimmt nicht exakt mit der Zeitreiheneinheit ${series?.unit || "–"} überein.`);
  }
  if (!Array.isArray(reference.sourceRefs) || !reference.sourceRefs.length) {
    throw new Error(`${context}: reference.sourceRefs fehlt.`);
  }
  for (const sourceRef of reference.sourceRefs) {
    if (typeof sourceRef !== "string" || !sourceIds?.has(sourceRef)) {
      throw new Error(`${context}: unbekannte Referenzquelle ${sourceRef || "–"}.`);
    }
  }

  return {
    role: reference.role,
    qualifier: reference.qualifier,
    exceedanceOperator: reference.exceedanceOperator
  };
}
