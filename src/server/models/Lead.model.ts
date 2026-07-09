import { Schema, model, models } from "mongoose";

const LeadSchema = new Schema(
  {
    created_at: String,
    name: String,
    email: { type: String, index: true },
    country_code: String,
    mobile_without_country_code: { type: String, index: true },
    company: String,
    city: String,
    state: String,
    country: String,
    lead_owner: String,
    crm_status: String,
    crm_note: String,
    data_source: String,
    possession_time: String,
    description: String,
    importBatchId: { type: String, index: true },
  },
  { timestamps: true }
);

export const Lead = models.Lead || model("Lead", LeadSchema);