import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Anomaly {
  id: string;
  type: string;
  fuzzy_score: number;
  factors: Record<string, number>;
  status: string;
  resource_id: string | null;
  amount: number | null;
  created_at: string;
}

const FACTOR_LABELS: Record<string, string> = {
  amount_deviation: "Amt Dev",
  vendor_risk: "Vendor",
  timing_risk: "Timing",
  cpu: "CPU",
  io: "I/O",
  cost: "Cost",
};

function scoreColor(score: number): string {
  if (score >= 0.8) return "bg-primary/90 text-primary-foreground";
  if (score >= 0.5) return "bg-cost-amber/80 text-background";
  if (score >= 0.3) return "bg-cost-amber/30 text-foreground";
  return "bg-cost-green/20 text-foreground";
}

function scoreBorder(score: number): string {
  if (score >= 0.8) return "ring-1 ring-primary/40";
  if (score >= 0.5) return "ring-1 ring-cost-amber/30";
  return "";
}

export default function AnomalyHeatmap() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.functions.invoke("fuzzy-score", {
        body: { action: "list" },
      });
      if (data?.anomalies) setAnomalies(data.anomalies);
      setLoading(false);
    }
    load();
  }, []);

  // Collect all unique factor keys across anomalies
  const factorKeys = Array.from(
    new Set(anomalies.flatMap((a) => Object.keys(a.factors ?? {})))
  );

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="h-32 flex items-center justify-center">
          <span className="text-xs text-muted-foreground font-mono animate-pulse">
            Loading heatmap…
          </span>
        </div>
      </div>
    );
  }

  if (anomalies.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Fuzzy Anomaly Heatmap
        </h3>
        <p className="text-xs text-muted-foreground">
          No anomalies scored yet. Use the fuzzy-score engine to analyze
          transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Fuzzy Anomaly Heatmap
        </h3>
        <span className="text-xs text-muted-foreground font-mono">
          {anomalies.length} scored
        </span>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto">
        <TooltipProvider delayDuration={150}>
          <table className="w-full border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="text-[10px] text-muted-foreground font-mono text-left pr-3 pb-2">
                  ID
                </th>
                <th className="text-[10px] text-muted-foreground font-mono text-left pr-3 pb-2">
                  Type
                </th>
                {factorKeys.map((k) => (
                  <th
                    key={k}
                    className="text-[10px] text-muted-foreground font-mono text-center pb-2 px-1"
                  >
                    {FACTOR_LABELS[k] || k}
                  </th>
                ))}
                <th className="text-[10px] text-muted-foreground font-mono text-center pb-2 px-1">
                  Score
                </th>
                <th className="text-[10px] text-muted-foreground font-mono text-left pb-2 pl-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((a) => (
                <tr key={a.id}>
                  <td className="text-[11px] font-mono text-muted-foreground pr-3 py-1 whitespace-nowrap">
                    {a.id.slice(0, 8)}
                  </td>
                  <td className="text-[11px] text-foreground pr-3 py-1 whitespace-nowrap capitalize">
                    {a.type}
                  </td>
                  {factorKeys.map((k) => {
                    const val = (a.factors as Record<string, number>)?.[k] ?? 0;
                    return (
                      <td key={k} className="p-0.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-10 h-8 rounded-sm flex items-center justify-center text-[10px] font-mono font-semibold transition-all cursor-default ${scoreColor(val)} ${scoreBorder(val)}`}
                            >
                              {val.toFixed(1)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="text-xs font-mono"
                          >
                            {FACTOR_LABELS[k] || k}: {val.toFixed(2)}
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    );
                  })}
                  <td className="p-0.5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-12 h-8 rounded-sm flex items-center justify-center text-[11px] font-mono font-bold transition-all cursor-default ${scoreColor(a.fuzzy_score)} ${scoreBorder(a.fuzzy_score)}`}
                        >
                          {a.fuzzy_score.toFixed(2)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs font-mono">
                        Combined fuzzy score: {a.fuzzy_score}
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  <td className="pl-3 py-1">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        a.status === "executed"
                          ? "bg-primary/15 text-primary"
                          : a.status === "detected"
                            ? "bg-cost-amber/15 text-cost-amber"
                            : a.status === "approved"
                              ? "bg-cost-green/15 text-cost-green"
                              : "bg-cost-blue/15 text-cost-blue"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TooltipProvider>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary/90" />
          <span className="text-[10px] text-muted-foreground">&gt; 0.8 Auto-execute</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-cost-amber/80" />
          <span className="text-[10px] text-muted-foreground">0.5–0.8 Review</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-cost-green/20" />
          <span className="text-[10px] text-muted-foreground">&lt; 0.5 No action</span>
        </div>
      </div>
    </div>
  );
}
