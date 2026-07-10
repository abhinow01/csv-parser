"use client";

import { useState, useCallback } from "react";
import Papa from "papaparse";
import { FileDropZone } from "@/components/csv-importer/FileDropzone";
import { DataTable } from "@/components/csv-importer/DataTable";
import { StatCard } from "@/components/csv-importer/StatCard";
import { ImportResult, Stage } from "@/server/types/import";
export default function CsvImportPage() {
  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [previewColumns, setPreviewColumns] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processError, setProcessError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileSelected = useCallback((selected: File) => {
    setUploadError(null);

    if (!selected.name.toLowerCase().endsWith(".csv")) {
      setUploadError("Please upload a valid .csv file.");
      return;
    }

    Papa.parse<Record<string, string>>(selected, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (res) => {
        if (!res.data.length) {
          setUploadError("This CSV appears to be empty.");
          return;
        }
        setFile(selected);
        setPreviewColumns(res.meta.fields ?? Object.keys(res.data[0]));
        setPreviewRows(res.data);
        setStage("preview");
      },
      error: (err) => {
        setUploadError(`Failed to parse CSV: ${err.message}`);
      },
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!file) return;
    setStage("processing");
    setProcessError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/csv/import", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Import failed (${res.status})`);
      }

      const data: ImportResult = await res.json();
      setResult(data);
      setStage("result");
    } catch (err) {
      setProcessError(err instanceof Error ? err.message : "Something went wrong.");
      setStage("preview");
    }
  }, [file]);

  const handleReset = useCallback(() => {
    setStage("upload");
    setFile(null);
    setPreviewColumns([]);
    setPreviewRows([]);
    setResult(null);
    setUploadError(null);
    setProcessError(null);
  }, []);

  const resultColumns: (keyof NonNullable<ImportResult["imported"][number]>)[] = [
    "name", "email", "country_code", "mobile_without_country_code",
    "company", "city", "state", "country", "lead_owner",
    "crm_status", "crm_note", "data_source", "possession_time",
    "description", "created_at",
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            GrowEasy CRM — AI CSV Importer
          </h1>
          <p className="text-sm text-gray-500">
            Upload any lead export. AI maps it to GrowEasy&apos;s CRM format automatically.
          </p>
        </header>

        <StepIndicator stage={stage} />

        {/* Step 1: Upload */}
        {stage === "upload" && (
          <FileDropZone onFileSelected={handleFileSelected} error={uploadError} />
        )}

        {/* Step 2: Preview */}
        {stage === "preview" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                  Preview — {file?.name}
                </h2>
                <p className="text-xs text-gray-500">
                  {previewRows.length} rows detected. Nothing has been sent yet.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  Confirm & Import
                </button>
              </div>
            </div>

            {processError && (
              <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg px-4 py-2">
                {processError}
              </p>
            )}

            <DataTable columns={previewColumns} rows={previewRows} />
          </section>
        )}

        {/* Step 3: Processing */}
        {stage === "processing" && (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">
              AI is mapping your leads into CRM format — this can take a moment for larger files…
            </p>
          </div>
        )}

        {/* Step 4: Result */}
        {stage === "result" && result && (
          <section className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 max-w-md">
              <StatCard label="Total Imported" value={result.totalImported} tone="success" />
              <StatCard label="Total Skipped" value={result.totalSkipped} tone="danger" />
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Imported Records
              </h3>
              <DataTable
                columns={resultColumns}
                rows={result.imported as unknown as Record<string, string>[]}
                emptyLabel="No records were imported."
              />
            </div>

            {result.skipped.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  Skipped Rows
                </h3>
                <DataTable
                  columns={["rowIndex", "reason"]}
                  rows={result.skipped as unknown as Record<string, string>[]}
                  emptyLabel="No rows were skipped."
                  maxHeight="30vh"
                />
              </div>
            )}

            <div className="flex justify-center pt-2">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 text-sm rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:opacity-90"
              >
                Import Another File
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function StepIndicator({ stage }: { stage: Stage }) {
  const steps: { key: Stage; label: string }[] = [
    { key: "upload", label: "Upload" },
    { key: "preview", label: "Preview" },
    { key: "processing", label: "Processing" },
    { key: "result", label: "Result" },
  ];
  const activeIndex = steps.findIndex((s) => s.key === stage);

  return (
    <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2 flex-1">
          <div
            className={`h-1.5 w-full rounded-full transition-colors ${
              i <= activeIndex ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-800"
            }`}
          />
        </div>
      ))}
    </div>
  );
}