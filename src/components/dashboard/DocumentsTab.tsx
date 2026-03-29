import { useState, useRef, useEffect } from "react";
import {
  Upload, FileText, CheckCircle, Clock, AlertCircle,
  Building2, Cloud, Shield, FileCheck, X, Plus, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { DocumentService, UserDocument } from "@/services/document-service";

// ─── Types ────────────────────────────────────────────────────

interface IntakeFormData {
  orgName: string;
  orgType: string;
  employees: string;
  annualSpend: string;
  cloudProviders: string[];
  frameworks: string[];
  contactName: string;
  contactEmail: string;
  notes: string;
}

const DOC_CATEGORIES = [
  { id: "soc2",    label: "SOC 2 Report",         icon: Shield,    color: "text-primary",    bg: "bg-primary/10 border-primary/20"         },
  { id: "iso",     label: "ISO 27001 Certificate", icon: FileCheck, color: "text-cost-green", bg: "bg-cost-green/10 border-cost-green/20"   },
  { id: "audit",   label: "Audit Report",          icon: FileText,  color: "text-cost-amber", bg: "bg-cost-amber/10 border-cost-amber/20"   },
  { id: "invoice", label: "Cloud Invoice",         icon: Cloud,     color: "text-cost-blue",  bg: "bg-cost-blue/10 border-cost-blue/20"     },
  { id: "sla",     label: "SLA Contract",          icon: FileText,  color: "text-primary",    bg: "bg-primary/10 border-primary/20"         },
  { id: "other",   label: "Other Document",        icon: FileText,  color: "text-muted-foreground", bg: "bg-white/5 border-white/10"        },
];

const CLOUD_PROVIDERS = ["AWS", "GCP", "Azure", "Oracle Cloud", "DigitalOcean", "Other"];
const FRAMEWORKS = ["SOC 2 Type II", "ISO 27001", "PCI DSS", "HIPAA", "GDPR", "NDPR", "None"];

// ─── Main Component ──────────────────────────────────────────

export default function DocumentsTab() {
  const [docs, setDocs] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("soc2");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<IntakeFormData>({
    orgName: "", orgType: "", employees: "", annualSpend: "",
    cloudProviders: [], frameworks: [], contactName: "", contactEmail: "", notes: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<"upload" | "form">("upload");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocs();
  }, []);

  async function loadDocs() {
    try {
      const data = await DocumentService.getDocuments();
      setDocs(data);
    } catch (err) {
      toast.error("Failed to load document library.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFiles(files: FileList) {
    setUploading(true);
    const cat = DOC_CATEGORIES.find(c => c.id === selectedCategory)!;
    
    try {
      const uploadPromises = Array.from(files).map(f => 
        DocumentService.uploadDocument(f, cat.label)
      );
      
      const results = await Promise.all(uploadPromises);
      setDocs(prev => [...results, ...prev]);
      toast.success(`${results.length} document(s) imported for TrustKit analysis.`);
    } catch (err: any) {
      console.error("Upload process error:", err);
      const msg = err.message || "Unknown error";
      if (msg.includes("Storage Error") || msg.includes("Database Error")) {
        toast.error(`Backend Not Ready: ${msg}. Please run the SQL setup in walkthrough.md`);
      } else {
        toast.error("One or more uploads failed. Please check file sizes and your Supabase connection.");
      }
    } finally {
      setUploading(false);
    }
  }

  function toggleProvider(p: string) {
    setForm(f => ({
      ...f,
      cloudProviders: f.cloudProviders.includes(p)
        ? f.cloudProviders.filter(x => x !== p)
        : [...f.cloudProviders, p],
    }));
  }

  function toggleFramework(fr: string) {
    setForm(f => ({
      ...f,
      frameworks: f.frameworks.includes(fr)
        ? f.frameworks.filter(x => x !== fr)
        : [...f.frameworks, fr],
    }));
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!form.orgName || !form.contactEmail) {
      toast.error("Please fill in your organisation name and contact email.");
      return;
    }
    
    setSubmitting(true);
    try {
      await DocumentService.submitIntake(form);
      setFormSubmitted(true);
      toast.success("Intake questionnaire submitted for TrustKit analysis.");
    } catch (err) {
      toast.error("Failed to submit intake form.");
    } finally {
      setSubmitting(false);
    }
  }

  const STATUS_CFG = {
    processing:   { label: "Processing",   icon: Clock,         color: "text-cost-amber", bg: "bg-cost-amber/10 border-cost-amber/20"   },
    verified:     { label: "Verified",     icon: CheckCircle,   color: "text-cost-green", bg: "bg-cost-green/10 border-cost-green/20"   },
    needs_review: { label: "Needs Review", icon: AlertCircle,   color: "text-primary",    bg: "bg-primary/10 border-primary/20"         },
  };

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <RefreshCw className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="text-[17px] font-black text-foreground flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            Client Document Portal
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Upload compliance documents & complete the intake questionnaire for TrustKit analysis.</p>
        </div>
        <div className="flex gap-2">
          {(["upload", "form"] as const).map(section => (
            <button key={section} onClick={() => setActiveSection(section)}
              className={`text-[11px] font-black px-4 py-2 rounded-xl uppercase tracking-widest transition-all ${activeSection === section ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground"}`}>
              {section === "upload" ? "📄 Documents" : "📋 Questionnaire"}
            </button>
          ))}
        </div>
      </div>

      {/* ── UPLOAD SECTION ─────────────────────────────────── */}
      {activeSection === "upload" && (
        <div className="space-y-5">
          {/* Category Selector */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 px-1">Document Category</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {DOC_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all ${selectedCategory === cat.id ? `${cat.bg} scale-[1.03]` : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"}`}>
                    <Icon size={16} className={selectedCategory === cat.id ? cat.color : "text-muted-foreground"} />
                    <span className={`text-[9px] font-black uppercase tracking-tighter leading-tight ${selectedCategory === cat.id ? cat.color : "text-muted-foreground"}`}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drop Zone */}
          <div
            className={`relative glass rounded-2xl border-2 border-dashed p-12 text-center transition-all cursor-pointer ${dragging || uploading ? "border-primary/60 bg-primary/5" : "border-white/10 hover:border-primary/30 hover:bg-white/[0.03]"}`}
            onDragOver={e => { e.preventDefault(); if (!uploading) setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length && !uploading) handleFiles(e.dataTransfer.files); }}
            onClick={() => !uploading && fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" multiple className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} accept=".pdf,.doc,.docx,.xlsx,.csv,.png,.jpg" />
            <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center border ${dragging || uploading ? "bg-primary/20 border-primary/40" : "bg-white/5 border-white/10"}`}>
              {uploading ? <RefreshCw size={24} className="text-primary animate-spin" /> : <Upload size={24} className={dragging ? "text-primary" : "text-muted-foreground"} />}
            </div>
            <p className="text-[14px] font-black text-foreground mb-1">
              {uploading ? "Uploading to TrustKit Storage..." : dragging ? "Drop to upload" : "Drop files or click to browse"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              PDF, DOC, DOCX, XLSX, CSV, PNG, JPG · Max 50MB per file
            </p>
            {!uploading && (
              <p className="text-[10px] text-muted-foreground mt-2 font-mono opacity-60">
                Category: <span className="text-foreground">{DOC_CATEGORIES.find(c => c.id === selectedCategory)?.label}</span>
              </p>
            )}
          </div>

          {/* Uploaded Documents List */}
          {docs.length > 0 && (
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <span className="text-[12px] font-black text-foreground uppercase tracking-tight">Governance Evidence Vault</span>
                <span className="text-[10px] text-muted-foreground font-mono">{docs.length} file{docs.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="divide-y divide-white/5">
                {docs.map(doc => {
                  const cfg = STATUS_CFG[doc.status] || STATUS_CFG.processing;
                  const StatusIcon = cfg.icon;
                  return (
                    <div key={doc.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText size={14} className="text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-foreground truncate">{doc.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{doc.size} · {doc.category} · {new Date(doc.uploaded_at || Date.now()).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color} ${doc.status === "processing" ? "animate-pulse" : ""}`}>
                          <StatusIcon size={10} className={doc.status === "processing" ? "animate-spin" : ""} />
                          {cfg.label}
                        </span>
                        <button onClick={() => setDocs(d => d.filter(x => x.id !== doc.id))}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── INTAKE QUESTIONNAIRE ────────────────────────────── */}
      {activeSection === "form" && (
        formSubmitted ? (
          <div className="glass rounded-2xl border border-cost-green/20 p-12 text-center">
            <div className="w-16 h-16 bg-cost-green/10 border border-cost-green/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-cost-green" />
            </div>
            <h3 className="text-[17px] font-black text-foreground mb-2">Questionnaire Submitted</h3>
            <p className="text-[12px] text-muted-foreground max-w-sm mx-auto">
              TrustKit agents will analyse your organisation's data within <strong className="text-foreground">24 hours</strong>. You'll receive a compliance report at <strong className="text-primary">{form.contactEmail}</strong>.
            </p>
            <button onClick={() => { setFormSubmitted(false); setForm({ orgName: "", orgType: "", employees: "", annualSpend: "", cloudProviders: [], frameworks: [], contactName: "", contactEmail: "", notes: "" }); }}
              className="mt-6 text-[11px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest flex items-center gap-2 mx-auto">
              <Plus size={12} /> Submit Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitForm} className="space-y-5">

            {/* Org Details */}
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
                <Building2 size={14} className="text-primary" />
                <span className="text-[12px] font-black text-foreground uppercase tracking-widest">Organisation Details</span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "orgName",    label: "Organisation Name *",        placeholder: "Acme Corp Pvt. Ltd."          },
                  { key: "orgType",    label: "Organisation Type",          placeholder: "Startup / SME / Enterprise"    },
                  { key: "employees",  label: "Number of Employees",        placeholder: "e.g. 50–200"                   },
                  { key: "annualSpend", label: "Estimated Annual Cloud Spend", placeholder: "e.g. ₹50L – ₹1Cr"          },
                  { key: "contactName",  label: "Contact Name *",           placeholder: "Jane Doe"                      },
                  { key: "contactEmail", label: "Contact Email *",          placeholder: "jane@acmecorp.com"              },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</label>
                    <input
                      type={key === "contactEmail" ? "email" : "text"}
                      value={(form as any)[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                      disabled={submitting}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Cloud Providers */}
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
                <Cloud size={14} className="text-cost-blue" />
                <span className="text-[12px] font-black text-foreground uppercase tracking-widest">Cloud Providers</span>
              </div>
              <div className="p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Select all that apply</p>
                <div className="flex flex-wrap gap-2">
                  {CLOUD_PROVIDERS.map(p => (
                    <button key={p} type="button" onClick={() => toggleProvider(p)}
                      disabled={submitting}
                      className={`text-[11px] font-black px-4 py-2 rounded-xl border transition-all uppercase tracking-widest ${form.cloudProviders.includes(p)
                        ? "bg-cost-blue/15 border-cost-blue/30 text-cost-blue"
                        : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Compliance Frameworks */}
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
                <Shield size={14} className="text-cost-green" />
                <span className="text-[12px] font-black text-foreground uppercase tracking-widest">Compliance Frameworks In Scope</span>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {FRAMEWORKS.map(fr => (
                    <button key={fr} type="button" onClick={() => toggleFramework(fr)}
                      disabled={submitting}
                      className={`text-[11px] font-black px-4 py-2 rounded-xl border transition-all uppercase tracking-widest ${form.frameworks.includes(fr)
                        ? "bg-cost-green/15 border-cost-green/30 text-cost-green"
                        : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"}`}>
                      {fr}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="glass rounded-2xl border border-white/5 p-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Additional Notes (Optional)</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Describe your compliance goals, active certifications, recent incidents, or anything TrustKit agents should know…"
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[12px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                disabled={submitting}
              />
            </div>

            {/* Submit */}
            <button type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-3.5 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.99] text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
              {submitting ? <RefreshCw size={15} className="animate-spin" /> : <CheckCircle size={15} />}
              {submitting ? "Analyzing Organization..." : "Submit to TrustKit for Analysis"}
            </button>
          </form>
        )
      )}
    </div>
  );
}
