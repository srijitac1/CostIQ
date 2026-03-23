import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Fuzzy membership functions ──────────────────────────────────────
const calculateMembership = (
  value: number,
  thresholds: { low: number; medium: number; high: number }
) => {
  const lowScore = Math.max(
    0,
    Math.min(1, (thresholds.medium - value) / (thresholds.medium - thresholds.low))
  );
  const mediumScore = Math.max(
    0,
    Math.min(
      1,
      value <= thresholds.medium
        ? (value - thresholds.low) / (thresholds.medium - thresholds.low)
        : (thresholds.high - value) / (thresholds.high - thresholds.medium)
    )
  );
  const highScore = Math.max(
    0,
    Math.min(1, (value - thresholds.medium) / (thresholds.high - thresholds.medium))
  );
  return { low: lowScore, medium: mediumScore, high: highScore };
};

// ── Combined anomaly scoring ────────────────────────────────────────
const calculateAnomalyScore = (factors: {
  amount: number;
  historicalAvg: number;
  vendorRisk: number;
  timingRisk: number;
}) => {
  const amountDeviation = factors.amount / factors.historicalAvg;
  const amountMembership = calculateMembership(amountDeviation, {
    low: 0.8,
    medium: 1.2,
    high: 1.5,
  });

  const score =
    amountMembership.high * 0.4 +
    factors.vendorRisk * 0.3 +
    factors.timingRisk * 0.3;

  return Math.min(1.0, score);
};

// ── Edge function handler ───────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { action } = body;

    // ── Score a single transaction ──────────────────────────────────
    if (action === "score") {
      const { type, amount, historicalAvg, vendorRisk, timingRisk, resourceId } = body;

      const fuzzyScore = calculateAnomalyScore({
        amount: amount ?? 0,
        historicalAvg: historicalAvg ?? 1,
        vendorRisk: vendorRisk ?? 0,
        timingRisk: timingRisk ?? 0,
      });

      const factors = {
        amount_deviation: amount && historicalAvg ? +(amount / historicalAvg).toFixed(2) : 0,
        vendor_risk: vendorRisk ?? 0,
        timing_risk: timingRisk ?? 0,
      };

      const { data, error } = await supabase.from("anomalies").insert({
        type: type ?? "cloud",
        fuzzy_score: +fuzzyScore.toFixed(2),
        factors,
        resource_id: resourceId ?? null,
        amount: amount ?? null,
        status: fuzzyScore >= 0.7 ? "detected" : "low_risk",
      }).select().single();

      if (error) throw error;

      return new Response(JSON.stringify({ anomaly: data, fuzzyScore }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Batch score multiple transactions ───────────────────────────
    if (action === "batch_score") {
      const { transactions } = body as {
        transactions: Array<{
          type: string;
          amount: number;
          historicalAvg: number;
          vendorRisk: number;
          timingRisk: number;
          resourceId?: string;
        }>;
      };

      const rows = transactions.map((tx) => {
        const fuzzyScore = calculateAnomalyScore({
          amount: tx.amount ?? 0,
          historicalAvg: tx.historicalAvg ?? 1,
          vendorRisk: tx.vendorRisk ?? 0,
          timingRisk: tx.timingRisk ?? 0,
        });
        return {
          type: tx.type ?? "cloud",
          fuzzy_score: +fuzzyScore.toFixed(2),
          factors: {
            amount_deviation: tx.amount && tx.historicalAvg ? +(tx.amount / tx.historicalAvg).toFixed(2) : 0,
            vendor_risk: tx.vendorRisk ?? 0,
            timing_risk: tx.timingRisk ?? 0,
          },
          resource_id: tx.resourceId ?? null,
          amount: tx.amount ?? null,
          status: fuzzyScore >= 0.7 ? "detected" : "low_risk",
        };
      });

      const { data, error } = await supabase.from("anomalies").insert(rows).select();
      if (error) throw error;

      return new Response(JSON.stringify({ anomalies: data, count: data.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Record an agent action on an anomaly ────────────────────────
    if (action === "act") {
      const { anomalyId, actionType, autoExecuted, result } = body;

      const { data: actionData, error: actErr } = await supabase
        .from("agent_actions")
        .insert({
          anomaly_id: anomalyId,
          action_type: actionType,
          auto_executed: autoExecuted ?? false,
          result: result ?? null,
        })
        .select()
        .single();
      if (actErr) throw actErr;

      // Update anomaly status
      const newStatus = autoExecuted ? "executed" : "approved";
      await supabase.from("anomalies").update({ status: newStatus }).eq("id", anomalyId);

      return new Response(JSON.stringify({ action: actionData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Get all anomalies (with optional status filter) ─────────────
    if (action === "list") {
      const { status, minScore } = body;
      let query = supabase.from("anomalies").select("*").order("created_at", { ascending: false });
      if (status) query = query.eq("status", status);
      if (minScore) query = query.gte("fuzzy_score", minScore);

      const { data, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify({ anomalies: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
