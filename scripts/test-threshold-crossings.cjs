const { getThresholdAssessments, getThresholdCrossings } = require("../threshold-crossings.js");

const hanpp = {
  unit: "%",
  reference: { role: "boundary", value: 10, unit: "%", exceedanceOperator: ">" },
  highRisk: { value: 20, unit: "%", exceedanceOperator: ">" },
  points: [{ year: 1910, value: 13 }, { year: 1960, value: 18.5 }, { year: 1970, value: 20.5 }]
};

const markers = getThresholdCrossings(hanpp, "core");
const assessments = getThresholdAssessments(hanpp);
if (assessments.boundary.status !== "already_crossed_at_start") throw new Error("HANPP-Grenzstatus muss die Überschreitung am Reihenanfang benennen.");
if (assessments.highRisk.status !== "crossed") throw new Error("HANPP-Hochrisikostatus muss crossed sein.");
if (markers.length !== 2) throw new Error("Für HANPP werden genau zwei Überschreitungsmarker erwartet.");
if (markers[0].kind !== "boundary" || markers[0].point.year !== 1910 || !markers[0].alreadyExceededAtStart) throw new Error("HANPP-Grenzmarker muss den bereits überschrittenen ersten Messpunkt 1910 markieren.");
if (markers[1].kind !== "high-risk" || markers[1].point.year !== 1970 || markers[1].alreadyExceededAtStart) throw new Error("HANPP-Hochrisikomarker muss die erstmalige belegte Überschreitung 1970 markieren.");
if (getThresholdCrossings(hanpp, "deep_dive").length) throw new Error("Vertiefende Messreihen dürfen keine Überschreitungsmarker erhalten.");
if (getThresholdAssessments(hanpp).boundary.status !== "already_crossed_at_start") throw new Error("Die Statuslogik muss unabhängig von der späteren Kurvenrolle nutzbar sein.");
if (getThresholdCrossings({ ...hanpp, reference: { ...hanpp.reference, unit: "Gt C" } }, "core").some(marker => marker.kind === "boundary")) throw new Error("Einheiteninkompatible Referenzen müssen gesperrt bleiben.");
if (getThresholdCrossings({ ...hanpp, reference: { value: 10, unit: "%" } }, "core").some(marker => marker.kind === "boundary")) throw new Error("Referenzen ohne explizite Richtung müssen gesperrt bleiben.");

const ocean = {
  unit: "Ωarag",
  reference: { role: "boundary", value: 2.86, unit: "Ωarag", exceedanceOperator: "<" },
  highRisk: { value: 2.5, unit: "Ωarag", exceedanceOperator: "<" },
  points: [{ year: 1982, value: 3.258 }, { year: 2021, value: 2.952 }],
  knownBoundaryCrossing: { year: 2025, value: 2.84, unit: "Ωarag" }
};
const oceanAssessments = getThresholdAssessments(ocean);
if (oceanAssessments.boundary.status !== "series_ends_before_known_crossing") throw new Error("Das Reihenende vor einer separat belegten Überschreitung muss explizit sein.");
if (oceanAssessments.highRisk.status !== "not_crossed") throw new Error("Der hohe Risikobereich der Ozeanreihe darf nicht als überschritten gelten.");

console.log("Überschreitungsmarker gültig: nur Kernkurve, keine Interpolation, kompatible Referenzen, HANPP 1910/1970.");
