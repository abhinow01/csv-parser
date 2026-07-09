import { randomUUID } from "crypto";
import { parseCsv } from "./csvParser.service";
import { extractLeadsWithAi } from "./aiExtraction.service";
import { saveLeads } from "../repositories/lead.repository";

export async function importCsv(fileText: string) {
  const rows = parseCsv(fileText);
  if (!rows.length) {
    return { imported: [], skipped: [], totalImported: 0, totalSkipped: 0 };
  }

  const aiResults = await extractLeadsWithAi(rows);

  const imported = aiResults
    .filter((r) => !r.skip && r.record)
    .map((r) => r.record!);

  const skipped = aiResults
    .filter((r) => r.skip)
    .map((r) => ({ rowIndex: r.rowIndex, reason: r.skipReason ?? "Unknown" }));

  const importBatchId = randomUUID();
  await saveLeads(imported, importBatchId);

  return {
    importBatchId,
    imported,
    skipped,
    totalImported: imported.length,
    totalSkipped: skipped.length,
  };
}