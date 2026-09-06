(function exposeThresholdCrossings(root) {
  const validOperators = new Set([">", "<"]);

  function validPoints(points) {
    return (points || [])
      .filter(point => Number.isFinite(Number(point?.year)) && Number.isFinite(Number(point?.value)))
      .map(point => ({ ...point, year: Number(point.year), value: Number(point.value) }))
      .sort((a, b) => a.year - b.year);
  }

  function firstPointBeyond(points, value, operator) {
    const ordered = validPoints(points);
    const exceeds = operator === ">" ? point => point.value > value : point => point.value < value;
    const index = ordered.findIndex(exceeds);
    return index < 0 ? null : { point: ordered[index], alreadyExceededAtStart: index === 0 };
  }

  function assessThreshold(series, threshold, knownCrossingPoint, requiredRole) {
    const points = validPoints(series?.points || series?.values);
    const unit = series?.unit;
    const value = Number(threshold?.value);
    const operator = threshold?.exceedanceOperator || series?.reference?.exceedanceOperator;
    const base = {
      thresholdValue: Number.isFinite(value) ? value : null,
      thresholdUnit: typeof threshold?.unit === "string" ? threshold.unit : null,
      exceedanceOperator: validOperators.has(operator) ? operator : null
    };
    if ((requiredRole && threshold?.role !== requiredRole) || !Number.isFinite(value) || typeof unit !== "string" || threshold?.unit !== unit || !validOperators.has(operator)) {
      return { ...base, status: "not_assessable", reason: "threshold_definition_incomplete_or_unit_mismatch" };
    }
    if (!points.length) return { ...base, status: "not_assessable", reason: "no_observations" };

    const firstCrossing = firstPointBeyond(points, value, operator);
    const lastCheckedPoint = points[points.length - 1];
    if (firstCrossing) {
      return {
        ...base,
        status: firstCrossing.alreadyExceededAtStart ? "already_crossed_at_start" : "crossed",
        firstCrossingPoint: firstCrossing.point,
        lastCheckedPoint
      };
    }

    const known = validPoints([knownCrossingPoint])[0];
    const knownExceeds = known && knownCrossingPoint?.unit === unit
      && (operator === ">" ? known.value > value : known.value < value);
    if (knownExceeds && known.year > lastCheckedPoint.year) {
      return { ...base, status: "series_ends_before_known_crossing", lastCheckedPoint, knownCrossingPoint: known };
    }
    return { ...base, status: "not_crossed", lastCheckedPoint };
  }

  function getThresholdAssessments(series) {
    return {
      boundary: assessThreshold(series, series?.reference, series?.knownBoundaryCrossing, "boundary"),
      highRisk: assessThreshold(series, series?.highRisk, series?.knownHighRiskCrossing)
    };
  }

  function getThresholdCrossings(series, curveRole) {
    if (curveRole !== "core") return [];
    const assessments = getThresholdAssessments(series);
    return [
      { kind: "boundary", label: "Planetare Grenze", assessment: assessments.boundary },
      { kind: "high-risk", label: "Hoher Risikobereich", assessment: assessments.highRisk }
    ].flatMap(({ kind, label, assessment }) => assessment.firstCrossingPoint ? [{
      kind,
      label,
      value: assessment.thresholdValue,
      operator: assessment.exceedanceOperator,
      unit: assessment.thresholdUnit,
      point: assessment.firstCrossingPoint,
      alreadyExceededAtStart: assessment.status === "already_crossed_at_start"
    }] : []);
  }

  const api = Object.freeze({ firstPointBeyond, assessThreshold, getThresholdAssessments, getThresholdCrossings });
  root.GWL_THRESHOLD_CROSSINGS = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
