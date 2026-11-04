"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  UploadCloud,
  LayoutGrid,
  List,
  Filter,
  ArrowRight,
  Eye,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { reportsService } from "@/services/reportsService";
import { MedicalRecord, DocumentCategory } from "@/types/report";
import { toast } from "sonner";

export default function RecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [institution, setInstitution] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const loadRecords = () => {
    reportsService.getReports(selectedCategory as DocumentCategory).then(setRecords);
  };

  useEffect(() => {
    loadRecords();
    const unsub = reportsService.subscribe(loadRecords);
    return unsub;
  }, [selectedCategory]);

  const filteredRecords = records.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUploadSubmit = async () => {
    if (!reportTitle) {
      toast.error("Please enter a document title");
      return;
    }
    setIsUploading(true);
    setProgress(30);
    setTimeout(() => setProgress(75), 300);
    setTimeout(async () => {
      setProgress(100);
      await reportsService.uploadReport(
        { name: `${reportTitle}.pdf`, size: 1024 * 1024 * 1.5, type: "application/pdf" },
        {
          title: reportTitle,
          category: (selectedCategory === "all" ? "lab_report" : selectedCategory) as DocumentCategory,
          institutionName: institution || "Metropolitan Clinical Laboratories",
          documentDate: new Date().toISOString().split("T")[0],
        }
      );
      setIsUploading(false);
      setUploadOpen(false);
      setReportTitle("");
      setInstitution("");
      setProgress(0);
      toast.success("Document uploaded and lab extraction completed!");
    }, 800);
  };

  return (
    <PageShell
      title="Medical Records & Reports"
      description="Your centralized health documents, verified lab tests, and extraction records."
      action={
        <Button onClick={() => setUploadOpen(true)} className="gap-2">
          <UploadCloud className="h-4 w-4" />
          <span>Upload Record</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Controls: Category Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Tabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-full sm:w-auto"
          >
            <TabsList className="flex flex-wrap h-auto gap-1 bg-slate-100 p-1">
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="lab_report">Lab Reports</TabsTrigger>
              <TabsTrigger value="prescription">Prescriptions</TabsTrigger>
              <TabsTrigger value="imaging">Imaging</TabsTrigger>
              <TabsTrigger value="discharge_summary">Discharge</TabsTrigger>
              <TabsTrigger value="vaccination">Vaccinations</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9"
              />
            </div>

            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-white shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                aria-label="List view"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content: Grid or List */}
        {filteredRecords.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents found"
            description="No medical documents match your current search query or category filter."
            actionLabel="Upload First Document"
            onAction={() => setUploadOpen(true)}
          />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecords.map((rec) => (
              <div
                key={rec.id}
                className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                      <FileText className="h-5 w-5" />
                    </div>
                    <StatusBadge
                      status={rec.verificationStatus === "Verified" ? "completed" : "borderline"}
                      customLabel={rec.verificationStatus}
                      size="sm"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors leading-snug">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {rec.institutionName}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {rec.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400">
                    <span>{rec.documentDate}</span> • <span>{rec.fileSize}</span>
                  </div>

                  <Link
                    href={`/records/${rec.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-800 transition-colors"
                  >
                    <span>View Report</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-slate-200/80 rounded-xl bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
            {filteredRecords.map((rec) => (
              <div
                key={rec.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-3"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {rec.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">
                      {rec.institutionName} • {rec.documentDate} • {rec.fileSize}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <StatusBadge
                    status={rec.verificationStatus === "Verified" ? "completed" : "borderline"}
                    customLabel={rec.verificationStatus}
                    size="sm"
                  />
                  <Link
                    href={`/records/${rec.id}`}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Medical Record</DialogTitle>
            <DialogDescription>
              Select a clinical laboratory report, imaging summary, or physician prescription.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div>
              <Label className="mb-1 block">Document Title</Label>
              <Input
                placeholder="e.g. Lipid Profile & Glucose Report"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
              />
            </div>

            <div>
              <Label className="mb-1 block">Laboratory / Clinic</Label>
              <Input
                placeholder="e.g. Metropolitan Diagnostics Center"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />
            </div>

            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
              <UploadCloud className="mx-auto h-8 w-8 text-teal-700 mb-2" />
              <p className="text-xs font-semibold text-slate-800">
                Click or drag & drop file to simulate upload
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                PDF, JPG, PNG up to 25 MB (Simulated processing)
              </p>
            </div>

            {isUploading && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Uploading & extracting lab values...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-700 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={isUploading}
              onClick={() => setUploadOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={isUploading} onClick={handleUploadSubmit}>
              {isUploading ? "Uploading..." : "Confirm & Extract"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

