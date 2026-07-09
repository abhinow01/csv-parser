import { geminiModel } from "../lib/gemini";
import { aiBatchResponseSchema } from "../validators/crm.schema";
import { AiRowResult } from "../types/crm";
import { RawRow } from "./csvParser.service";
import {GoogleGenAI} from '@google/genai';
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({apiKey: apiKey});

const BATCH_SIZE = 20;
const MAX_RETRIES = 3;
const CONCURRENCY = 3; // free tier RPM is limited (~15 req/min for flash) — keep this modest

const SYSTEM_PROMPT = `You are a data-mapping engine for a real-estate CRM called GrowEasy.

You will receive a JSON array of raw CSV rows. Each row has an arbitrary, unknown set of column names — they may come from Facebook Lead Ads, Google Ads, Excel exports, real estate CRMs, or manual spreadsheets. Column names, casing, order, and structure are NOT fixed and will vary between requests.

Map each row into this exact CRM schema:
- created_at: ISO-parsable date string usable with JS \`new Date(created_at)\`. If no date is present, use an empty string.
- name, email, country_code, mobile_without_country_code, company, city, state, country, lead_owner, crm_note, possession_time, description: free text, best-effort extraction. Use "" if unavailable.
- crm_status: MUST be exactly one of ["GOOD_LEAD_FOLLOW_UP","DID_NOT_CONNECT","BAD_LEAD","SALE_DONE"], or "" if nothing maps confidently. Never invent a status.
- data_source: MUST be exactly one of ["leads_on_demand","meridian_tower","eden_park","varah_swamy","sarjapur_plots"], or "" if no confident match. Never invent a source.

Rules:
1. If a row has multiple emails, put the first in "email" and append the rest into "crm_note" (e.g. "Other emails: a@x.com, b@y.com").
2. If a row has multiple phone numbers, put the first in "mobile_without_country_code" (digits only, no country code) and append the rest into "crm_note".
3. Put the country code (e.g. "+91") separately in "country_code" if determinable, else "".
4. Use "crm_note" as a catch-all for any useful info (remarks, follow-up notes, extra identifiers) that doesn't fit a dedicated field.
5. SKIP a row (skip: true) if it has neither a usable email NOR a usable mobile number. Give a short skipReason.
6. Never fabricate data. Empty string is always safer than a guess.
7. Preserve the original rowIndex on every object so results can be matched back to input rows.

Return ONLY a JSON array matching this shape exactly, with length equal to the input array length:
[{"rowIndex": number, "skip": boolean, "skipReason"?: string, "record"?: { "created_at": string, "name": string, "email": string, "country_code": string, "mobile_without_country_code": string, "company": string, "city": string, "state": string, "country": string, "lead_owner": string, "crm_status": string, "crm_note": string, "data_source": string, "possession_time": string, "description": string }}]`;

async function callBatch(rows: RawRow[]): Promise<AiRowResult[]> {
  const userPayload = rows.map((r) => ({ rowIndex: r.rowIndex, ...r.data }));

const result = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  config: {
    systemInstruction: SYSTEM_PROMPT,
    responseMimeType: "application/json",
  },
  contents: [
    {
      role: "user",
      parts: [
        {
          text: `Input rows:\n${JSON.stringify(userPayload)}`,
        },
      ],
    },
  ],
});

const parsed = JSON.parse(result.text!);
  return aiBatchResponseSchema.parse(parsed) as AiRowResult[];
}

async function callBatchWithRetry(rows: RawRow[]): Promise<AiRowResult[]> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await callBatch(rows);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      lastErr = err;
      // Gemini free tier throws 429 on rate limit — back off harder for that case
      const isRateLimit = err?.status === 429 || /rate/i.test(err?.message ?? "");
      const backoffMs = isRateLimit ? 2000 * attempt : 500 * 2 ** (attempt - 1);
      await new Promise((res) => setTimeout(res, backoffMs));
    }
  }
  console.error("AI batch failed after retries:", lastErr);
  return rows.map((r) => ({
    rowIndex: r.rowIndex,
    skip: true,
    skipReason: "AI processing failed after retries",
  }));
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function extractLeadsWithAi(rows: RawRow[]): Promise<AiRowResult[]> {
  const batches = chunk(rows, BATCH_SIZE);
  const results: AiRowResult[] = [];

  for (let i = 0; i < batches.length; i += CONCURRENCY) {
    const slice = batches.slice(i, i + CONCURRENCY);
    const settled = await Promise.all(slice.map(callBatchWithRetry));
    settled.forEach((batchResult) => results.push(...batchResult));
    // small pause between concurrency groups to stay under free-tier RPM
    if (i + CONCURRENCY < batches.length) {
      await new Promise((res) => setTimeout(res, 1000));
    }
  }

  return results.sort((a, b) => a.rowIndex - b.rowIndex);
}