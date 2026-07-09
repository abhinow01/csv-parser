import { connectDB } from "../lib/mongodb";
import { Lead } from "../models/Lead.model";
import { CrmRecord } from "../types/crm";

export async function saveLeads(records:CrmRecord[] , importBatchId: string){
    await connectDB()
    if(!records.length) return []
    return Lead.insertMany(
        records.map((r)=> ({...r ,importBatchId })),
        {ordered : false}
    );
}