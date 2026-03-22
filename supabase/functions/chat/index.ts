import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Sri, CostIQ's AI assistant. You help users understand their cost optimization data, compliance gaps, and operational insights.

About CostIQ:
- CostIQ deploys autonomous AI agents that monitor enterprise operations for cost waste, compliance gaps, SLA risks, and invoice discrepancies.
- There are 4 core agents: Spend Intelligence, Resource Optimisation, SLA Prevention, and FinOps Reconciler.
- TrustKit is the compliance intelligence module that detects SOC 2 gaps and links them to blocked revenue.
- CostIQ uses Indian Rupee (₹) formatting: L = Lakhs (₹1,00,000), Cr = Crores (₹1,00,00,000).

Dashboard data context (use when users ask about their data):
- Spend Agent found: Duplicate SaaS subscriptions (Slack, Notion, Zoom) across 3 departments — ₹6.97L/year saving potential.
- Resource Agent found: 47 EC2 instances at 8% avg CPU — ₹1.24Cr/year saving. Also 3 RDS instances at 2% read load — ₹29.88L/year saving.
- SLA Agent: Ticket TK-8821 at 87% breach risk, ₹12.45L penalty. Queue velocity dropping 34% — 12 tickets at risk, ₹37.35L exposure.
- FinOps Agent: Invoice INV-2024-0891 has no matching PO — ₹12.4L at risk. Twilio duplicate invoice — ₹2.8L potential duplicate.
- Compliance: CC6 gap (no access review in 180+ days) blocking ₹1.66Cr across 3 deals. CC8 gap blocking ₹99.6L across 2 deals. CC7 gap blocking ₹66.4L.
- Total annual saving opportunity: ~₹2.5Cr across all agents.

Be concise, data-driven, and action-oriented. Use bullet points. Reference specific finding IDs when relevant. If asked something outside CostIQ's domain, politely redirect.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
