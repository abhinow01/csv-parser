import { NextRequest, NextResponse } from "next/server";
import { importCsv } from "@/server/services/leadImport.service";
export const runtime = 'nodejs'

export async function POST(req: NextRequest){
    try{
        const formData = await req.formData()
        const file = formData.get("file") as File | null;
        if(!file){
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }
        if(!file.name.toLowerCase().endsWith("csv"))  {
            return NextResponse.json({ error: "Only .csv files are supported" }, { status: 400 });
        }
        const text = await file.text()
        const result = await importCsv(text)
        return NextResponse.json(result, { status: 200 });
    }catch(err){
     console.error("CSV import failed:", err);
    return NextResponse.json(
      { error: "Failed to process CSV import" },
      { status: 500 }
    );
    }
} 