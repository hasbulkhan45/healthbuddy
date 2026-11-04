"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Plus,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Check,
  ShieldCheck,
  Clock,
  ArrowRight,
  Info,
  BookOpen,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { aiService } from "@/services/aiService";
import { AIConversation, AIMessage, AIContextSelection } from "@/types/ai";
import { toast } from "sonner";

export default function AIBuddyPage() {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("conv_001");
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [contextModalOpen, setContextModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [contextSelection, setContextSelection] = useState<AIContextSelection>({
    medicalReports: true,
    medicines: true,
    symptoms: true,
    healthMeasurements: true,
    healthProfile: true,
    generalKnowledgeOnly: false,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = () => {
    aiService.getConversations().then((convs) => {
      setConversations(convs);
      const active = convs.find((c) => c.id === activeConversationId) || convs[0];
      if (active) {
        setMessages([...active.messages]);
      }
    });
  };

  useEffect(() => {
    loadConversations();
    const unsub = aiService.subscribe(loadConversations);
    return unsub;
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || isTyping) return;

    setInputText("");
    setIsTyping(true);

    try {
      await aiService.sendMessage({
        conversationId: activeConversationId,
        message: textToSend,
        selectedContext: contextSelection,
      });
    } catch {
      toast.error("Failed to generate response");
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewConversation = () => {
    const newId = `conv_${Date.now()}`;
    setActiveConversationId(newId);
    setMessages([]);
    toast.success("New conversation started.");
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied response to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestedPrompts = [
    "Explain my latest blood report (Lipid Panel & Glucose)",
    "Help me understand my HbA1c reading of 5.4%",
    "Prepare me for my doctor visit with Dr. Jenkins",
    "Explain my Vitamin D3 and Omega-3 supplements",
    "Review my 7-day resting heart rate & BP trends",
    "Help me understand tension headaches and screen time",
  ];

  return (
    <PageShell
      title="AI Health Companion"
      description="Context-aware educational health insights, medical report explanations, and consultation preparation."
      badge={
        <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800 border border-teal-200/80">
          Educational Assistant
        </span>
      }
      action={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setContextModalOpen(true)}
            className="gap-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-teal-700" />
            <span className="hidden sm:inline">AI Data Permissions</span>
          </Button>
          <Button size="sm" onClick={handleNewConversation} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span>New Chat</span>
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Conversations (4 cols on desktop) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Recent Consultations
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              {conversations.length} threads
            </span>
          </div>

          <div className="space-y-1">
            {conversations.map((c) => {
              const isSelected = c.id === activeConversationId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveConversationId(c.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    isSelected
                      ? "bg-teal-50/80 border border-teal-200/80 text-teal-900"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <p className="text-xs font-bold truncate leading-tight">
                    {c.title}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-1">
                    {c.lastMessagePreview}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Quick Context Summary */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-1.5 text-[11px] text-slate-600">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>Active Context Permissions</span>
              <button
                onClick={() => setContextModalOpen(true)}
                className="text-teal-700 hover:underline"
              >
                Edit
              </button>
            </div>
            <p className="text-slate-500 leading-normal">
              AI Buddy has access to your verified lab reports, vitals, and medication list.
            </p>
          </div>
        </div>

        {/* Right Column: Chat Workspace (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white shadow-xs flex flex-col h-[650px] overflow-hidden">
          {/* Chat Header */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-700 text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="font-bold text-slate-900">AI Health Buddy</span>
                <span className="text-[10px] text-slate-400 block sm:inline sm:ml-2">
                  Context: Labs • Vitals • Medications
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Simulated Engine</span>
            </div>
          </div>

          {/* Persistent Educational Notice */}
          <div className="bg-amber-50/60 border-b border-amber-200/60 px-4 py-2 text-[11px] text-amber-900 flex items-center gap-2">
            <Info className="h-3.5 w-3.5 text-amber-700 shrink-0" />
            <span>
              <strong>Educational Notice:</strong> AI Buddy provides educational health explanations and does not replace professional medical diagnosis or prescription.
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.length === 0 ? (
              <div className="py-8 space-y-6 text-center">
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-base font-bold text-slate-900">
                    How can I assist your health management today?
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Ask me to explain laboratory test ranges, summarize longitudinal vitals,
                    or compile talking points for your next doctor appointment.
                  </p>
                </div>

                <div className="space-y-2 max-w-lg mx-auto text-left">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Suggested Consultations
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {suggestedPrompts.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(p)}
                        className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-2.5 text-xs text-slate-700 hover:bg-teal-50/60 hover:border-teal-200 hover:text-teal-900 transition-all text-left"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 max-w-[85%] text-xs leading-relaxed space-y-2 ${
                        isUser
                          ? "bg-teal-700 text-white font-medium rounded-br-xs"
                          : "bg-slate-50 border border-slate-200/80 text-slate-800 rounded-bl-xs"
                      }`}
                    >
                      <div className="whitespace-pre-line prose prose-sm max-w-none text-xs">
                        {msg.content}
                      </div>

                      {/* Demonstration Citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/60 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            Demonstration References
                          </span>
                          {msg.citations.map((c) => (
                            <div
                              key={c.id}
                              className="text-[10px] text-slate-500 bg-white/80 p-1.5 rounded border border-slate-200/60"
                            >
                              <strong>{c.sourceName}:</strong> {c.excerpt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Message Action Footer (for Assistant) */}
                    {!isUser && (
                      <div className="flex items-center gap-2 mt-1.5 px-1 text-[11px] text-slate-400">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="hover:text-slate-700 flex items-center gap-1"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span>Copy</span>
                        </button>
                        <span>•</span>
                        <button
                          onClick={() => toast.success("Feedback submitted.")}
                          className="hover:text-slate-700"
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => toast.success("Feedback recorded.")}
                          className="hover:text-slate-700"
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 max-w-[200px]">
                <Sparkles className="h-4 w-4 text-teal-700 animate-spin" />
                <span>AI Buddy is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <Input
                placeholder="Ask about your test results, medicines, or doctor visit..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isTyping}
                className="flex-1 text-xs h-10"
              />
              <Button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="h-10 px-4 gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Context Selection Modal */}
      <Dialog open={contextModalOpen} onOpenChange={setContextModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>AI Data Access Permissions</DialogTitle>
            <DialogDescription>
              Select which health records AI Buddy is authorized to incorporate when answering your questions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {[
              { key: "medicalReports", label: "Medical & Laboratory Reports", desc: "Allows extraction summaries of blood & imaging tests" },
              { key: "medicines", label: "Medication & Supplements", desc: "Allows scheduling context & drug information lookups" },
              { key: "healthMeasurements", label: "Health Measurements (Vitals)", desc: "Enables BP, heart rate, and glucose trend analysis" },
              { key: "symptoms", label: "Symptoms Journal", desc: "Allows correlation between symptoms and lifestyle logs" },
              { key: "healthProfile", label: "General Health Profile", desc: "Includes age, BMI, allergies, and family history" },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">{item.label}</p>
                  <p className="text-[11px] text-slate-500">{item.desc}</p>
                </div>
                <Switch
                  checked={(contextSelection as any)[item.key]}
                  onCheckedChange={(checked) =>
                    setContextSelection((prev) => ({ ...prev, [item.key]: checked }))
                  }
                />
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-400">
            Frontend demonstration. In production, permission scopes will be enforced by Supabase Row-Level Security.
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

