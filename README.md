# GrowEasy AI CSV Importer

An AI-powered CSV importer that ingests lead exports in **any column layout** (Facebook Lead Ads, Google Ads, Excel sheets, real estate CRMs, manual spreadsheets, etc.) and intelligently maps them into the GrowEasy CRM schema using an LLM.

## How it works

1. **Upload** — user drags/drops or picks a `.csv` file.
2. **Preview** — the file is parsed entirely client-side (no network call) into a scrollable, sticky-header table so the user can sanity-check the raw data before anything is sent anywhere.
3. **Confirm** — only on explicit confirmation is the file sent to the backend.
4. **AI Extraction** — the backend parses the CSV into rows, batches them, and sends each batch to Gemini with a schema-locked prompt. The model maps arbitrary/unknown columns onto the fixed GrowEasy CRM fields, flags rows that lack both an email and a mobile number as skipped, and returns strict JSON.
5. **Result** — parsed records are saved to MongoDB and returned to the frontend, which shows imported vs. skipped counts and both record sets in tables.

## Tech Stack

- **Framework:** Next.js (App Router) — single project, no separate backend service
- **API layer:** Next.js Route Handlers (`app/api/**/route.ts`)
- **AI:** Google Gemini (`gemini-2.0-flash`, free tier, JSON mode)
- **Database:** MongoDB (via Mongoose)
- **CSV parsing:** PapaParse (both client-side preview and server-side parsing)
- **Validation:** Zod

## Architecture

```
src/
  app/
    page.tsx                     # Upload -> Preview -> Confirm -> Result UI
    api/
      csv/
        import/route.ts          # POST endpoint, thin controller
  components/
    csv-importer/
      FileDropzone.tsx
      DataTable.tsx
      StatCard.tsx
  server/
    services/
      csvParser.service.ts       # CSV -> raw row objects
      aiExtraction.service.ts    # Batching, prompt, retries, Gemini calls
      leadImport.service.ts      # Orchestrates parse -> AI -> save
    repositories/
      lead.repository.ts         # All MongoDB access lives here
    models/
      Lead.model.ts
    lib/
      mongodb.ts
      gemini.ts
    types/
      crm.ts
      import.ts
    validators/
      crm.schema.ts               # Zod schemas for CRM record + AI response

```

The layering (controller -> service -> repository) keeps the AI provider, the database, and the HTTP layer independent of each other — swapping Gemini for another LLM, or MongoDB for another store, only touches one file each.

## Prerequisites

- Node.js 20+
- A MongoDB connection string (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)
- A free Gemini API key from [Google AI Studio](https://ai.google.dev/)

## Setup

1. **Clone and install dependencies**

   ```bash
   git clone <repo-url>
   cd <repo-name>
   npm install
   ```

2. **Configure environment variables**

   Create a `.env.local` file in the project root:

   ```
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

4. **Build for production**

   ```bash
   npm run build
   npm start
   ```

## CRM Field Mapping Rules

The AI extraction prompt enforces the following, regardless of input column names:

- `crm_status` is restricted to one of `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, `SALE_DONE`, or left blank if no confident match.
- `data_source` is restricted to one of `leads_on_demand`, `meridian_tower`, `eden_park`, `varah_swamy`, `sarjapur_plots`, or left blank if no confident match.
- `created_at` is normalized to a string parsable by `new Date(created_at)`.
- Extra emails/phone numbers beyond the first are appended into `crm_note` rather than discarded.
- Rows with **neither** a usable email **nor** a usable mobile number are skipped and reported back to the user, with a reason.
- The model is instructed to never fabricate values — an empty string is used whenever a field can't be confidently determined.

## API

### `POST /api/csv/import`

**Request:** `multipart/form-data` with a `file` field containing the `.csv` file.

**Response:**

```json
{
  "importBatchId": "uuid",
  "imported": [ /* CrmRecord[] */ ],
  "skipped": [ { "rowIndex": 0, "reason": "No email or mobile number found" } ],
  "totalImported": 42,
  "totalSkipped": 3
}
```

## Known Limitations

- Gemini's free tier (`gemini-2.0-flash`) has a modest requests-per-minute limit. Very large CSVs (many batches) may take longer to process or occasionally retry due to rate limiting; the extraction service backs off and retries automatically, and any batch that ultimately fails is marked as skipped rather than failing the whole import.
- No authentication layer is included — this is a scoped assignment deliverable, not a multi-tenant production app.

## Roadmap / Not Yet Included

- [ ] Docker setup for local reproducibility (see below — added separately)
- [ ] Deployment instructions (Vercel + MongoDB Atlas)

---

*Docker setup and deployment instructions will be appended to this README in a follow-up update.*