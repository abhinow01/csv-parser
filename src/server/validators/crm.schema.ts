import {z} from "zod"
import { CRM_STATUSES , DATA_SOURCES } from "../types/crm"

export const crmRecordSchema = z.object({
    created_at: z.string(),
    name: z.string().default(""),
    email: z.string().default(""),
    country_code: z.string().default(""),
    mobile_without_country_code: z.string().default(""),
    company: z.string().default(""),
    city: z.string().default(""),
    state: z.string().default(""),
    country: z.string().default(""),
    lead_owner: z.string().default(""),
    crm_status: z.union([z.enum(CRM_STATUSES),z.literal("")]).default(""),
    crm_note: z.string().default(""),
    data_source: z.union([z.enum(DATA_SOURCES), z.literal("")]).default(""),
    possession_time: z.string().default(""),
    description: z.string().default(""),
})

export const aiRowResultSchema = z.object({
    rowIndex: z.number(),
    skip:z.boolean(),
    skipReason: z.string().optional(),
    record: crmRecordSchema.optional() 
})
export const aiBatchResponseSchema = z.array(aiRowResultSchema)