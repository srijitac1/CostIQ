/**
 * TrustKit — PDF Report Generation Service
 *
 * Generates branded compliance audit reports in PDF format using jsPDF.
 * Reports include: executive summary, audit findings, compliance gaps,
 * agent insights, and financial impact summary.
 */

import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import type { AuditFinding } from "./audit-service";

// ─── Brand palette (hex) ──────────────────────────────────────
const BRAND = {
  primary:    [99,  102, 241] as [number, number, number],   // violet-500
  green:      [34,  197,  94] as [number, number, number],   // green-500
  amber:      [245, 158,  11] as [number, number, number],   // amber-500
  blue:       [59,  130, 246] as [number, number, number],   // blue-500
  dark:       [9,    9,  11] as [number, number, number],    // near-black
  surface:    [24,  24,  27] as [number, number, number],    // zinc-900
  border:     [39,  39,  42] as [number, number, number],    // zinc-800
  muted:      [113, 113, 122] as [number, number, number],   // zinc-500
  white:      [255, 255, 255] as [number, number, number],
};

export type ReportType = "full" | "findings" | "compliance" | "executive";

export interface ReportOptions {
  type: ReportType;
  orgName?: string;
  preparedBy?: string;
  findings?: AuditFinding[];
  complianceControls?: Array<{ control: string; name: string; gap: string; revenueAtRisk: number; blockedDeals: number; status: string }>;
  agentSummaries?: Record<string, { findings: number; summary: string }>;
  upload?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────

function setFont(doc: jsPDF, size: number, style: "normal" | "bold" = "normal", color = BRAND.white) {
  doc.setFontSize(size);
  doc.setFont("helvetica", style);
  doc.setTextColor(...color);
}

function drawRect(doc: jsPDF, x: number, y: number, w: number, h: number, color: [number, number, number], radius = 0) {
  doc.setFillColor(...color);
  if (radius > 0) {
    doc.roundedRect(x, y, w, h, radius, radius, "F");
  } else {
    doc.rect(x, y, w, h, "F");
  }
}

function drawLine(doc: jsPDF, x1: number, y1: number, x2: number, y2: number, color = BRAND.border) {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.3);
  doc.line(x1, y1, x2, y2);
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", notation: "compact", maximumFractionDigits: 1 }).format(n);
}

function riskColor(risk: string): [number, number, number] {
  if (risk === "critical") return BRAND.primary;
  if (risk === "high")     return BRAND.amber;
  if (risk === "medium")   return BRAND.blue;
  return BRAND.green;
}

// ─── Cover Page ───────────────────────────────────────────────

function drawCoverPage(doc: jsPDF, options: ReportOptions) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  // Background
  drawRect(doc, 0, 0, pw, ph, BRAND.dark);

  // Top accent bar
  drawRect(doc, 0, 0, pw, 4, BRAND.primary);

  // Left sidebar gradient effect
  drawRect(doc, 0, 4, 8, ph - 4, [20, 20, 26]);
  drawRect(doc, 0, 4, 2, ph - 4, BRAND.primary);

  // Logo area
  setFont(doc, 28, "bold", BRAND.primary);
  doc.text("Cost", 24, 52);
  setFont(doc, 28, "normal", BRAND.white);
  doc.text("IQ", 24 + doc.getTextWidth("Cost") + 1, 52);
  setFont(doc, 10, "normal", BRAND.muted);
  doc.text(".ai", 24 + doc.getTextWidth("CostIQ") + 1, 52);

  // TrustKit subtitle
  setFont(doc, 9, "bold", BRAND.primary);
  doc.text("TRUSTKIT™ — COMPLIANCE INTELLIGENCE ENGINE", 24, 62);

  // Divider
  drawLine(doc, 24, 70, pw - 24, 70, [40, 40, 50]);

  // Report title
  const titles: Record<ReportType, string> = {
    full:        "Full Governance Audit Report",
    findings:    "Audit Findings Report",
    compliance:  "Compliance Gap Analysis",
    executive:   "Executive Summary",
  };
  setFont(doc, 26, "bold", BRAND.white);
  doc.text(titles[options.type], 24, 98);

  // Organisation
  if (options.orgName) {
    setFont(doc, 11, "normal", BRAND.muted);
    doc.text("Prepared for:", 24, 114);
    setFont(doc, 14, "bold", BRAND.white);
    doc.text(options.orgName, 24, 124);
  }

  // Date & preparer
  const now = new Date();
  setFont(doc, 9, "normal", BRAND.muted);
  doc.text(`Report Date: ${now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, 24, 140);
  if (options.preparedBy) {
    doc.text(`Prepared by: ${options.preparedBy}`, 24, 150);
  }

  // Confidential badge
  drawRect(doc, 24, 166, 80, 14, [30, 20, 40], 4);
  setFont(doc, 8, "bold", BRAND.primary);
  doc.text("⚠  CONFIDENTIAL", 32, 175.5);

  // Bottom info
  setFont(doc, 7, "normal", BRAND.muted);
  doc.text(`© ${now.getFullYear()} CostIQ.ai — TrustKit Compliance Intelligence`, 24, ph - 14);
  doc.text("Powered by Gemini AI + Multi-Agent Governance Architecture", pw - 24, ph - 14, { align: "right" });
}

// ─── Section Header ───────────────────────────────────────────

function drawSectionHeader(doc: jsPDF, title: string, y: number, subtitle?: string): number {
  const pw = doc.internal.pageSize.getWidth();
  drawRect(doc, 14, y, pw - 28, 18, BRAND.surface, 3);
  drawRect(doc, 14, y, 3, 18, BRAND.primary);
  setFont(doc, 10, "bold", BRAND.white);
  doc.text(title.toUpperCase(), 22, y + 11.5);
  if (subtitle) {
    setFont(doc, 8, "normal", BRAND.muted);
    doc.text(subtitle, pw - 18, y + 11.5, { align: "right" });
  }
  return y + 26;
}

// ─── Stats Row ────────────────────────────────────────────────

function drawStatCards(
  doc: jsPDF,
  stats: Array<{ label: string; value: string; color: [number, number, number] }>,
  y: number
): number {
  const pw = doc.internal.pageSize.getWidth();
  const margin = 14;
  const gap = 4;
  const count = stats.length;
  const cardW = (pw - margin * 2 - gap * (count - 1)) / count;

  stats.forEach((s, i) => {
    const x = margin + i * (cardW + gap);
    drawRect(doc, x, y, cardW, 28, BRAND.surface, 3);
    drawRect(doc, x, y, cardW, 3, s.color, 3);

    setFont(doc, 6, "bold", BRAND.muted);
    doc.text(s.label.toUpperCase(), x + 6, y + 12);
    setFont(doc, 13, "bold", s.color);
    doc.text(s.value, x + 6, y + 23);
  });

  return y + 38;
}

// ─── Findings Table ───────────────────────────────────────────

function drawFindingsTable(doc: jsPDF, findings: AuditFinding[], startY: number, pageH: number): number {
  const pw = doc.internal.pageSize.getWidth();
  const margin = 14;
  const cols = { id: 28, risk: 18, title: 76, status: 22, impact: 30 };
  let y = startY;

  // Table header
  drawRect(doc, margin, y, pw - margin * 2, 10, [30, 30, 38]);
  setFont(doc, 6, "bold", BRAND.muted);
  let x = margin + 3;
  doc.text("FINDING ID", x, y + 6.5); x += cols.id;
  doc.text("RISK", x, y + 6.5);      x += cols.risk;
  doc.text("TITLE", x, y + 6.5);     x += cols.title;
  doc.text("STATUS", x, y + 6.5);    x += cols.status;
  doc.text("ANNUAL IMPACT", x, y + 6.5);
  y += 12;

  // Rows
  findings.forEach((f, idx) => {
    if (y > pageH - 30) {
      doc.addPage();
      drawRect(doc, 0, 0, pw, doc.internal.pageSize.getHeight(), BRAND.dark);
      y = 20;
    }

    const rowBg = idx % 2 === 0 ? BRAND.surface : [20, 20, 26] as [number, number, number];
    drawRect(doc, margin, y - 1, pw - margin * 2, 10, rowBg);

    const rc = riskColor(f.risk);
    x = margin + 3;

    setFont(doc, 6.5, "normal", BRAND.muted);
    doc.text(f.finding_id?.slice(0, 14) || "—", x, y + 5.5); x += cols.id;

    // Risk pill
    drawRect(doc, x - 1, y + 0.5, cols.risk - 2, 7, rc, 2);
    setFont(doc, 5.5, "bold", BRAND.dark);
    doc.text(f.risk?.toUpperCase() || "", x + 1, y + 5.5); x += cols.risk;

    setFont(doc, 6.5, "normal", BRAND.white);
    const titleLines = doc.splitTextToSize(f.title || "", cols.title - 4);
    doc.text(titleLines[0], x, y + 5.5); x += cols.title;

    setFont(doc, 6, "normal", BRAND.muted);
    doc.text((f.status || "pending").replace("_", " "), x, y + 5.5); x += cols.status;

    setFont(doc, 6.5, "bold", BRAND.green);
    doc.text(f.impact_annual ? fmt(f.impact_annual) : "—", x, y + 5.5);

    y += 10;
  });

  return y;
}

// ─── Main export function ─────────────────────────────────────

export async function generateReport(options: ReportOptions): Promise<string> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw  = doc.internal.pageSize.getWidth();
  const ph  = doc.internal.pageSize.getHeight();

  const { findings = [], complianceControls = [], orgName = "Your Organisation", type } = options;

  // ── Page 1: Cover ──────────────────────────────────────────
  drawCoverPage(doc, options);

  // ── Page 2: Executive Summary ──────────────────────────────
  doc.addPage();
  drawRect(doc, 0, 0, pw, ph, BRAND.dark);
  drawRect(doc, 0, 0, pw, 4, BRAND.primary);

  let y = 18;
  setFont(doc, 7, "normal", BRAND.muted);
  doc.text("PAGE 2 — EXECUTIVE SUMMARY", 14, y);
  y = drawSectionHeader(doc, "Executive Summary", y + 6, `Governance cycle — ${new Date().toLocaleDateString("en-IN")}`);

  const totalSavings     = findings.reduce((s, f) => s + (f.impact_annual || 0), 0);
  const criticalCount    = findings.filter(f => f.risk === "critical").length;
  const highCount        = findings.filter(f => f.risk === "high").length;
  const revenueAtRisk    = complianceControls.reduce((s, c) => s + c.revenueAtRisk, 0);

  y = drawStatCards(doc, [
    { label: "Findings identified",   value: String(findings.length),  color: BRAND.white   },
    { label: "Critical findings",     value: String(criticalCount),     color: BRAND.primary },
    { label: "High-risk exposures",   value: String(highCount),         color: BRAND.amber   },
    { label: "Total savings opportunity", value: fmt(totalSavings),    color: BRAND.green   },
    { label: "Revenue at risk",       value: fmt(revenueAtRisk),        color: BRAND.primary },
  ], y);

  // Summary text
  setFont(doc, 9, "normal", BRAND.white);
  const summaryText = [
    `TrustKit's autonomous multi-agent governance engine completed a full scan of ${orgName}'s`,
    `infrastructure, SaaS subscriptions, SLA compliance, and billing records.`,
    ``,
    `The scan identified ${findings.length} audit findings with a combined annual savings opportunity`,
    `of ${fmt(totalSavings)}. Of these, ${criticalCount} findings are classified as Critical and require`,
    `immediate remediation. ${highCount} High-risk findings have been flagged for priority review.`,
    ``,
    `${complianceControls.length} compliance guardrails were evaluated. Revenue at risk from compliance`,
    `gaps amounts to ${fmt(revenueAtRisk)}.`,
  ];
  doc.text(summaryText, 14, y + 4);
  y += summaryText.length * 5.5 + 10;

  // Agent fleet summary
  if (options.agentSummaries) {
    y = drawSectionHeader(doc, "Agent Dispatch Summary", y + 4, "Multi-Agent Orchestration Report");
    const agents = Object.entries(options.agentSummaries);
    agents.forEach(([agentId, data]) => {
      if (y > ph - 25) { doc.addPage(); drawRect(doc, 0, 0, pw, ph, BRAND.dark); y = 20; }
      drawRect(doc, 14, y, pw - 28, 16, BRAND.surface, 3);
      drawRect(doc, 14, y, 3, 16, BRAND.primary);
      setFont(doc, 7, "bold", BRAND.primary);
      doc.text(`${agentId.toUpperCase()} AGENT`, 22, y + 7);
      setFont(doc, 7, "bold", BRAND.white);
      doc.text(`${data.findings} findings`, pw - 20, y + 7, { align: "right" });
      setFont(doc, 6.5, "normal", BRAND.muted);
      doc.text(data.summary, 22, y + 13);
      y += 20;
    });
  }

  // ── Page 3: Findings ───────────────────────────────────────
  if (findings.length > 0 && (type === "full" || type === "findings")) {
    doc.addPage();
    drawRect(doc, 0, 0, pw, ph, BRAND.dark);
    drawRect(doc, 0, 0, pw, 4, BRAND.primary);
    setFont(doc, 7, "normal", BRAND.muted);
    doc.text("PAGE 3 — AUDIT FINDINGS", 14, 15);
    y = drawSectionHeader(doc, "Audit Findings", 21, `${findings.length} active findings`);
    drawFindingsTable(doc, findings, y, ph);
  }

  // ── Page 4: Compliance Gaps ────────────────────────────────
  if (complianceControls.length > 0 && (type === "full" || type === "compliance")) {
    doc.addPage();
    drawRect(doc, 0, 0, pw, ph, BRAND.dark);
    drawRect(doc, 0, 0, pw, 4, BRAND.primary);
    setFont(doc, 7, "normal", BRAND.muted);
    doc.text("PAGE 4 — COMPLIANCE GAP ANALYSIS", 14, 15);
    y = drawSectionHeader(doc, "Compliance Guardrails", 21, `${complianceControls.length} gaps identified`);

    complianceControls.forEach((ctrl) => {
      if (y > ph - 30) { doc.addPage(); drawRect(doc, 0, 0, pw, ph, BRAND.dark); y = 20; }
      drawRect(doc, 14, y, pw - 28, 22, BRAND.surface, 3);
      drawRect(doc, 14, y, 3, 22, ctrl.status === "done" ? BRAND.green : BRAND.primary);

      setFont(doc, 6, "bold", BRAND.primary);
      doc.text(ctrl.control, 22, y + 7);
      setFont(doc, 7.5, "bold", BRAND.white);
      doc.text(ctrl.name, 22, y + 13);
      setFont(doc, 6.5, "normal", BRAND.muted);
      doc.text(ctrl.gap, 22, y + 18.5);

      setFont(doc, 7, "bold", BRAND.amber);
      doc.text(fmt(ctrl.revenueAtRisk), pw - 18, y + 10, { align: "right" });
      setFont(doc, 6, "normal", BRAND.muted);
      doc.text(`${ctrl.blockedDeals} deals at risk`, pw - 18, y + 16, { align: "right" });

      y += 26;
    });
  }

  // ── Footer on all pages ─────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    if (p === 1) continue; // cover has its own footer
    setFont(doc, 6, "normal", BRAND.muted);
    doc.text(`TrustKit™ Governance Report · ${orgName}`, 14, ph - 8);
    doc.text(`Page ${p} of ${totalPages}`, pw - 14, ph - 8, { align: "right" });
    drawLine(doc, 14, ph - 12, pw - 14, ph - 12, BRAND.border);
  }

  // ── Save & Trigger Local Download ──────────────────────────
  const filename = `TrustKit_${type}_report_${new Date().toISOString().slice(0, 10)}_${Math.random().toString(36).slice(2, 6).toUpperCase()}.pdf`;
  doc.save(filename);

  // ── Async Backend Archiving (Fire-and-forget) ───────────────
  if (options.upload) {
    (async () => {
      try {
        const pdfBlob = doc.output("blob");
        const filePath = `${type}/${filename}`;

        // 1. Upload to Supabase Storage
        const { error: storageError } = await supabase.storage
          .from("governance-reports")
          .upload(filePath, pdfBlob, {
            contentType: "application/pdf",
            upsert: true
          });

        if (storageError) {
          console.warn("Audit Archive: Storage upload failed silently.", storageError);
          return;
        }

        // 2. Clear metadata record in Database
        const { error: dbError } = await (supabase as any)
          .from("governance_reports")
          .insert({
            filename,
            file_path: filePath,
            report_type: type,
            org_name: orgName,
            findings_count: findings.length,
            savings_total: findings.reduce((s, f) => s + (f.impact_annual || 0), 0)
          });

        if (dbError) {
          console.warn("Audit Archive: Database record creation failed silently.", dbError);
        } else {
          console.log("Audit Archive: Report successfully persisted to cloud.");
        }
      } catch (err) {
        console.warn("Audit Archive: Silent background failure.", err);
      }
    })();
  }
  
  return filename;
}
