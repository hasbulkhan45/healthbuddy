"use client";

import React, { useState } from "react";
import { BookOpen, Clock, Search, ArrowRight, User } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { mockArticles, HealthArticle } from "@/data/mock/knowledge-base";

export default function KnowledgeBasePage() {
  const [query, setQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<HealthArticle | null>(null);

  const filtered = mockArticles.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.summary.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <PageShell
      title="Health Education & Knowledge Base"
      description="Peer-informed educational guides on cardiovascular health, glycemic balance, and clinical lab literacy."
      breadcrumbs={[{ label: "Knowledge Base" }]}
    >
      <div className="space-y-6 max-w-5xl">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex items-center gap-3">
          <Search className="h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search health articles by keyword or category..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 shadow-none text-xs focus-visible:ring-0 p-0"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filtered.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all cursor-pointer group"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                  {art.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors leading-snug">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {art.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="h-3 w-3" />
                  {art.readTime}
                </span>
                <span className="font-semibold text-teal-700 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Read Article <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Article Modal */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100 self-start">
                  {selectedArticle.category}
                </span>
                <DialogTitle className="text-lg font-bold text-slate-900 pt-1">
                  {selectedArticle.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 flex items-center gap-2 pt-0.5">
                  <span>{selectedArticle.author}</span> • <span>{selectedArticle.readTime}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-3 text-xs text-slate-700 leading-relaxed">
                {selectedArticle.content.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <div className="rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500 border border-slate-100">
                HealthBuddy educational material is developed for patient literacy and does not replace customized clinical consultations.
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

