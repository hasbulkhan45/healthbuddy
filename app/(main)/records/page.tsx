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

const categoryStyles: Record<string, { icon: React.ComponentType<{ className?: string }>; gradient: string; badgeBg: string; borderHover: string; bgClass: string }> = {
  lab_report: { icon: FileText, gradient: "from-blue-500 to-indigo-600", badgeBg: "bg-blue-50 text-blue-700 border-blue-200", borderHover: "hover:border-blue-300", bgClass: "card-vibrant-blue" },
  prescription: { icon: FileText, gradient: "from-violet-600 to-indigo-600", badgeBg: "bg-violet-50 text-violet-700 border-violet-200", borderHover: "hover:border-violet-300", bgClass: "card-vibrant-violet" },
  imaging: { icon: FileText, gradient: "from-cyan-500 to-teal-600", badgeBg: "bg-cyan-50 text-cyan-800 border-cyan-200", borderHover: "hover:border-cyan-300", bgClass: "card-vibrant-cyan" },
  discharge_summary: { icon: FileText, gradient: "from-rose-500 to-pink-600", badgeBg: "bg-rose-50 text-rose-700 border-rose-200", borderHover: "hover:border-pink-300", bgClass: "card-vibrant-rose" },
  vaccination: { icon: FileText, gradient: "from-emerald-400 to-teal-500", badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200", borderHover: "hover:border-emerald-300", bgClass: "card-vibrant-emerald" },
  all: { icon: FileText, gradient: "from-slate-500 to-slate-600", badgeBg: "bg-slate-50 text-slate-700 border-slate-200", borderHover: "hover:border-slate-300", bgClass: "bg-white" },
};

export default function RecordsPage() {
  // Demo user ID for unauthenticated access
  const demoUserId = "demo-user-001";

  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [institution, setInstitution] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const loadRecords = async () => {
    const data = await reportsService.getReports(selectedCategory as DocumentCategory, demoUserId);
    setRecords(data);
  };

  useEffect(() => {
    loadRecords();
    const unsub = reportsService.subscribe(loadRecords);
    return () => { unsub(); };
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

    // In a real implementation, you would get the file from a file input
    // For now, we'll simulate with a mock file
    const mockFile = new File(
      [new ArrayBuffer(1024 * 1024 * 1.5)],
      `${reportTitle}.pdf`,
      { type: "application/pdf" }
    );

    try {
      setProgress(75);
      await reportsService.uploadReport(
        { name: mockFile.name, size: mockFile.size, type: mockFile.type },
        {
          title: reportTitle,
          category: (selectedCategory === "all" ? "lab_report" : selectedCategory) as DocumentCategory,
          institutionName: institution || "Metropolitan Clinical Laboratories",
          documentDate: new Date().toISOString().split("T")[0],
        },
        demoUserId
      );
      setProgress(100);
      setIsUploading(false);
      setUploadOpen(false);
      setReportTitle("");
      setInstitution("");
      setProgress(0);
      toast.success("Document uploaded and lab extraction completed!");
    } catch (error) {
      setIsUploading(false);
      setProgress(0);
      toast.error("Failed to upload document");
      console.error(error);
    }
  };

  const getCategoryStyles = (category: string) => categoryStyles[category] || categoryStyles.all;

  return (
    <PageShell
      title="Medical Records & Reports"
      description="Your centralized health documents, verified lab tests, and extraction records."
      action={
        <Button onClick={() => setUploadOpen(true)} className="gap-2 badge-gradient-blue-indigo">
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
            <TabsList className="flex flex-wrap h-auto gap-1 bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="all" className="px-3 py-1.5">All Documents</TabsTrigger>
              <TabsTrigger value="lab_report" className="px-3 py-1.5">Lab Reports</TabsTrigger>
              <TabsTrigger value="prescription" className="px-3 py-1.5">Prescriptions</TabsTrigger>
              <TabsTrigger value="imaging" className="px-3 py-1.5">Imaging</TabsTrigger>
              <TabsTrigger value="discharge_summary" className="px-3 py-1.5">Discharge</TabsTrigger>
              <TabsTrigger value="vaccination" className="px-3 py-1.5">Vaccinations</TabsTrigger>
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
            variant="dashed"
          />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecords.map((rec) => {
              const styles = getCategoryStyles(rec.category);
              const Icon = styles.icon;
              return (
                <Link
                  key={rec.id}
                  href={`/records/${rec.id}`}
                  className={`group rounded-2xl border border-slate-200/80 ${styles.bgClass} p-5 shadow-xs transition-all ${styles.borderHover} hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between space-y-4`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${styles.gradient} text-white shadow-xs`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles.badgeBg}`}>
                          {rec.category.replace(/_/g, " ")}
                        </span>
                      </div>
                      <StatusBadge
                        status={rec.verificationStatus === "Verified" ? "completed" : "borderline"}
                        customLabel={rec.verificationStatus}
                        size="sm"
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
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
                    <div className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                      <span>View Report</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
            {filteredRecords.map((rec) => {
              const styles = getCategoryStyles(rec.category);
              const Icon = styles.icon;
              return (
                <Link
                  key={rec.id}
                  href={`/records/${rec.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr ${styles.gradient} text-white shadow-xs`}>
                      <Icon className="h-4 w-4" />
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
                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                      Details
                    </span>
                  </div>
                </Link>
              );
            })}
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

            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
              <UploadCloud className="mx-auto h-8 w-8 text-blue-600 mb-2" />
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
                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-300"
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
            <Button disabled={isUploading} onClick={handleUploadSubmit} className="badge-gradient-blue-indigo">
              {isUploading ? "Uploading..." : "Confirm & Extract"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}