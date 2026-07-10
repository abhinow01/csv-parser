export interface CrmRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
}

export interface SkippedRow {
  rowIndex: number;
  reason: string;
}

export interface ImportResult {
  importBatchId: string;
  imported: CrmRecord[];
  skipped: SkippedRow[];
  totalImported: number;
  totalSkipped: number;
}

export type Stage = "upload" | "preview" | "processing" | "result";