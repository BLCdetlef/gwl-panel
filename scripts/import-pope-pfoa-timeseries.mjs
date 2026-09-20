import crypto from "node:crypto";
import fs from "node:fs/promises";

const targetUrl = new URL("../data/knowledge/gwl_pfas_pope_global_v0.1.json", import.meta.url);
const recordUrl = "https://zenodo.org/records/19705810";
const sourceFiles = [
  {
    key: "PFOA_BG_production.txt",
    checksum: "b44d4281ca22e73df9dd72954c6a98cc",
    role: "industrielle Produktion"
  },
  {
    key: "PFOA_BG_product_use.txt",
    checksum: "60e8a1a15f80452df4a41df6e75e688e",
    role: "Produktnutzung und Entsorgung"
  },
  {
    key: "PFOA_BG_airports.txt",
    checksum: "0ef4c808d3f18a00fd6b0decedd1e16e",
    role: "Flughäfen / Feuerlöschschäume"
  }
];

function parseAnnualRows(text, key) {
  const rows = text.split(/\r?\n/).flatMap(line => {
    const columns = line.trim().split(/\s+/);
    if (!/^\d{4}$/.test(columns[0] || "")) return [];
    const year = Number(columns[0]);
    const totalKg = Number(columns[3]);
    if (!Number.isFinite(totalKg)) throw new Error(`${key}: ungültiger Jahreswert für ${year}.`);
    return [{ year, totalKg }];
  });
  if (rows.length !== 70 || rows[0]?.year !== 1951 || rows.at(-1)?.year !== 2020) {
    throw new Error(`${key}: erwartet werden 70 Jahreswerte 1951–2020.`);
  }
  return rows;
}

const imported = [];
for (const source of sourceFiles) {
  const url = `https://zenodo.org/records/19705810/files/${source.key}?download=1`;
  const response = await fetch(url, {
    headers: {
      Accept: "text/plain",
      "User-Agent": "gwl-panel-data-import/1.0 (reproducible scientific data import)"
    }
  });
  if (!response.ok) throw new Error(`${source.key}: Download fehlgeschlagen (${response.status}).`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const checksum = crypto.createHash("md5").update(bytes).digest("hex");
  if (checksum !== source.checksum) throw new Error(`${source.key}: MD5-Prüfsumme stimmt nicht.`);
  imported.push({ ...source, url, rows: parseAnnualRows(bytes.toString("utf8"), source.key) });
}

const points = Array.from({ length: 70 }, (_, index) => {
  const year = 1951 + index;
  const totalKg = imported.reduce((sum, source) => sum + source.rows[index].totalKg, 0);
  const tonnes = Number((totalKg / 1000).toFixed(6));
  return {
    year,
    value: tonnes,
    display: `${year}: ${tonnes.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} t/Jahr`,
    sourceRefs: ["src_pope_zenodo_v31_pfoa_annual"]
  };
});

const cumulativeTonnes = Number(points.reduce((sum, point) => sum + point.value, 0).toFixed(6));
if (Math.abs(cumulativeTonnes - 3957.096) > 0.001) {
  throw new Error(`PFOA-Prüfsumme: ${cumulativeTonnes} t statt ungefähr 3957,096 t.`);
}

const payload = JSON.parse(await fs.readFile(targetUrl, "utf8"));
payload.presentation = {
  ...(payload.presentation || {}),
  primaryMeasurementId: "global_pfas_pope_inventory",
  primaryTimeSeriesId: "global_pfoa_air_emissions_pope_1951_2020",
  gwlTimeSeriesDisplay: "link_only",
  hideTimeSeriesInKnowledgeView: true
};
payload.timeSeries = [
  {
    id: "global_pfoa_air_emissions_pope_1951_2020",
    label: "Modellierte globale PFOA-Emissionen in die Luft · POPE",
    metric: "Jährliche modellierte PFOA-Emissionen aus industrieller Produktion, Produktnutzung und -entsorgung sowie Flughäfen in die Luft",
    unit: "t/Jahr",
    geography: "Global",
    period: "1951–2020",
    dataStartYear: 1951,
    dataEndYear: 2020,
    dataNature: "assessed_model_estimate",
    worseningDirection: "increase",
    reference: {
      type: "no_global_quantity_boundary",
      display: "Kein globaler PFAS-Mengengrenzwert"
    },
    finding: "POPE modelliert für PFOA zunächst einen starken Anstieg der jährlichen globalen Luftemissionen; nach einem Rückgang steigen die Schätzwerte bis 2020 erneut.",
    uncertainty: "Best-Guess-Modellreihe für eine einzelne PFAS-Substanz. Sie ist keine Messreihe, umfasst nicht alle PFAS und bildet weder Umweltkonzentrationen noch Gesundheitsrisiken ab.",
    methodNote: "Für jedes Jahr wurden die POPE-Spalten total_kg_per_year aus den drei Best-Guess-Dateien für Produktion, Produktnutzung und Flughäfen addiert und von Kilogramm in Tonnen umgerechnet.",
    sourceRefs: ["src_pope_zenodo_v31_pfoa_annual", "src_pope_2026"],
    provenance: {
      sourceFile: sourceFiles.map(source => source.key).join("; "),
      sourceUrl: recordUrl,
      locator: "In allen drei Textdateien: Kopfzeile time, west_kg_per_year, east_kg_per_year, total_kg_per_year; Jahreszeilen 1951–2020.",
      fields: [
        "time → Jahr",
        "total_kg_per_year in PFOA_BG_production.txt → globale PFOA-Luftemissionen aus Produktion",
        "total_kg_per_year in PFOA_BG_product_use.txt → globale PFOA-Luftemissionen aus Produktnutzung und Entsorgung",
        "total_kg_per_year in PFOA_BG_airports.txt → globale PFOA-Luftemissionen aus Flughäfen / Feuerlöschschäumen"
      ],
      extraction: "Ausgelesen wurden je Datei 70 vorhandene Jahreswerte 1951–2020. Die drei Jahressummen ergeben kumuliert 3957,096 t und reproduzieren damit die veröffentlichte POPE-Best-Guess-Luftsumme für PFOA (Rundungsdifferenz < 0,001 t).",
      transformation: "Die drei vorhandenen Sektorwerte wurden je Jahr addiert und durch 1000 von kg/Jahr in t/Jahr umgerechnet; keine Interpolation und keine zeitliche Glättung."
    },
    points
  }
];

const annualSource = {
  id: "src_pope_zenodo_v31_pfoa_annual",
  title: "POPE PFAS emission inventory v3.1 – PFOA Best-Guess-Jahresdateien",
  type: "research_dataset",
  publisher: "Zenodo",
  access: "open_full_text",
  year: 2026,
  url: recordUrl,
  doi: "10.5281/zenodo.19705810",
  files: sourceFiles.map(source => ({
    name: source.key,
    role: source.role,
    checksum: `md5:${source.checksum}`,
    url: `https://zenodo.org/records/19705810/files/${source.key}?download=1`
  }))
};
payload.sources = [
  ...(payload.sources || []).filter(source => source.id !== annualSource.id),
  annualSource
];

await fs.writeFile(targetUrl, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`POPE-PFOA importiert: ${points.length} Jahreswerte, ${points[0].year}–${points.at(-1).year}, kumuliert ${cumulativeTonnes} t.`);
