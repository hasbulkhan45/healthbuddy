"use client";

import React, { ChangeEvent, DragEvent, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, FileText, ImageIcon, LoaderCircle, Paperclip, UploadCloud, X } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prescriptionService } from "@/services/prescriptionService";
import { toast } from "sonner";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

export default function PrescriptionUploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [manualDate, setManualDate] = useState("");
  const [validationError, setValidationError] = useState("");

  const fileSummary = useMemo(
    () => files.reduce((sum, file) => sum + file.size, 0),
    [files]
  );

  const validate = (incoming: File[]) => {
    const invalid = incoming.find((file) => !ACCEPTED_TYPES.includes(file.type) && !/\.(pdf|png|jpe?g)$/i.test(file.name));
    if (invalid) {
      setValidationError(`${invalid.name} is not an accepted prescription file type. Please use PDF, JPG, JPEG, or PNG.`);
      return false;
    }
    setValidationError("");
    return true;
  };

  const addFiles = (incoming: File[]) => {
    const next = [...files, ...incoming].slice(0, 10);
    if (validate(incoming)) {
      setFiles(next);
    }
  };

  const onPicker = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addFiles(Array.from(event.target.files));
    }
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files) {
      addFiles(Array.from(event.dataTransfer.files));
    }
  };

  const removeFile = (index: number) => setFiles((items) => items.filter((_, i) => i !== index));

  const handleUpload = async () => {
    if (files.length === 0) {
      setValidationError("Please choose at least one prescription document to upload.");
      return;
    }

    setUploading(true);
    setProgress(15);
    const first = files[0];

    const timer = window.setInterval(() => {
      setProgress((current) => Math.min(current + 12, 83));
    }, 250);

    try {
      const uploaded = await prescriptionService.uploadPrescription(
        { name: first.name, type: first.type || "application/pdf", size: first.size },
        {
          documentName: first.name,
          fileType: first.type.includes("pdf") ? "pdf" : first.type.includes("png") ? "png" : first.type.includes("jpeg") ? "jpeg" : "jpg",
          prescriptionDate: manualDate || new Date().toISOString().split("T")[0],
          doctorName: "Needs review",
          doctorSpecialty: "Unspecified",
          clinicName: "Unspecified",
          visitDate: "",
          followUpDate: "",
          diagnosisText: "Not extracted yet.",
          testsAdvised: [],
          generalInstructions: [],
          extractedFields: {},
        }
      );
      window.clearInterval(timer);
      setProgress(100);
      toast.success("Prescription uploaded. OCR extraction is queued for review.");
      router.push(`/prescriptions/${uploaded.id}`);
    } catch {
      toast.error("Upload failed. Please retry.");
      setUploading(false);
      setProgress(0);
    } finally {
      window.clearInterval(timer);
    }
  };

  return (
    <PageShell
      title="Upload Prescription"
      description="Upload a PDF or image for OCR extraction, verification, and automated care planning."
      breadcrumbs={[{ label: "Prescriptions", href: "/prescriptions" }, { label: "Upload" }]}
    >
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div
            onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${dragOver ? "border-blue-400 bg-blue-50" : "border-slate-300 bg-slate-50"}`}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-sm">
              <UploadCloud className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Drag & drop prescription files</h3>
            <p className="mt-2 text-sm text-slate-500">PDF, JPG, JPEG, or PNG. Multiple pages may be uploaded as part of one prescription.</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Button variant="default" onClick={() => inputRef.current?.click()} className="gap-2" disabled={uploading}>
                <Paperclip className="h-4 w-4" />
                Add files
              </Button>
              <Button variant="outline" type="button" onClick={() => setFiles([])} disabled={uploading || files.length === 0}>Clear</Button>
            </div>
            <input ref={inputRef} type="file" multiple accept=".pdf,image/png,image/jpeg,image/jpg" className="hidden" onChange={onPicker} />
          </div>

          {validationError && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {files.length > 0 && (
            <div className="mt-5 space-y-3">
              {files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                      {file.type.includes("pdf") ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">{file.name}</div>
                      <div className="text-[11px] text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  </div>
                  <button onClick={() => removeFile(index)} className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700" aria-label={`Remove ${file.name}`}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {uploading && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Processing prescription</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <Link href="/prescriptions" className="text-sm font-semibold text-slate-600 hover:text-slate-900">Back to prescriptions</Link>
            <Button onClick={handleUpload} disabled={uploading || files.length === 0} className="gap-2">
              {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {uploading ? "Uploading..." : "Upload and process"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Prescription details</h3>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="prescription-date">Prescription date (optional)</Label>
                <Input id="prescription-date" type="date" value={manualDate} onChange={(event) => setManualDate(event.target.value)} className="mt-1" />
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                <div className="font-semibold text-slate-800">Demo safety note</div>
                <div className="mt-1">OCR and AI extraction are simulated for this phase. Patient confirmation is required before any medication reminder or follow-up is activated.</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Upload summary</div>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between"><span>Files selected</span><span className="font-semibold text-slate-900">{files.length}</span></div>
              <div className="flex items-center justify-between"><span>Total size</span><span className="font-semibold text-slate-900">{fileSummary > 0 ? `${(fileSummary / 1024 / 1024).toFixed(2)} MB` : "0 MB"}</span></div>
              <div className="flex items-center justify-between"><span>Accepted formats</span><span className="font-semibold text-slate-900">PDF/JPG/PNG</span></div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
