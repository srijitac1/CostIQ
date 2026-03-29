import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AuditService, AuditFinding } from "@/services/audit-service";
import { AlertTriangle, ShieldCheck, Info } from "lucide-react";

interface DayData {
  date: string;
  maxScore: number;
  count: number;
  primaryRisk: string;
}

export default function AnomalyHeatmap() {
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const findings = await AuditService.getFindings();
        
        // Aggregate last 90 days
        const targetDays = 90;
        const now = new Date();
        const dataMap: Record<string, { max: number; count: number; risks: Record<string, number> }> = {};

        // Pre-fill last 90 days with zeroes
        for (let i = 0; i < targetDays; i++) {
          const d = new Date();
          d.setDate(now.getDate() - i);
          const key = d.toISOString().split("T")[0];
          dataMap[key] = { max: 0, count: 0, risks: {} };
        }

        // Fill with real data
        findings.forEach(f => {
          if (!f.created_at) return;
          const key = f.created_at.split("T")[0];
          if (dataMap[key]) {
            dataMap[key].count++;
            dataMap[key].max = Math.max(dataMap[key].max, (f.score || 0) / 100);
            const risk = f.risk || "unknown";
            dataMap[key].risks[risk] = (dataMap[key].risks[risk] || 0) + 1;
          }
        });

        const sortedDays = Object.entries(dataMap)
          .map(([date, meta]) => {
            const topRisk = Object.entries(meta.risks).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
            return {
              date,
              maxScore: meta.max,
              count: meta.count,
              primaryRisk: topRisk
            };
          })
          .sort((a, b) => a.date.localeCompare(b.date));

        setDays(sortedDays);
      } catch (err) {
        console.error("Heatmap load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getIntensityColor = (score: number) => {
    if (score === 0) return "bg-white/[0.02] border-white/5";
    if (score < 0.3) return "bg-cost-blue/20 border-cost-blue/20 text-cost-blue";
    if (score < 0.6) return "bg-cost-amber/40 border-cost-amber/30 text-cost-amber";
    if (score < 0.8) return "bg-primary/50 border-primary/40 text-white shadow-[0_0_10px_rgba(99,102,241,0.2)]";
    return "bg-primary border-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] animate-pulse";
  };

  if (loading) {
    return (
      <div className="glass rounded-[2rem] p-8 border-white/5 overflow-hidden">
        <div className="h-40 flex items-center justify-center">
            <RefreshCw className="animate-spin text-primary opacity-50" size={24} />
        </div>
      </div>
    );
  }

  // Group into weeks for the grid
  const weeks: DayData[][] = [];
  let currentWeek: DayData[] = [];
  
  days.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="glass rounded-[2.5rem] p-8 border-white/5 shadow-2xl relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/20 transition-all duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-[15px] font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={16} className="text-primary" />
                Global Risk Distribution Matrix
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">Fuzzy logic intensity across 90-day governance cycles</p>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Score Engine:</span>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Active (v2.1)</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <TooltipProvider delayDuration={100}>
            <div className="flex gap-2 min-w-max">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-2">
                  {week.map((day) => (
                    <Tooltip key={day.date}>
                      <TooltipTrigger asChild>
                        <div 
                          className={`w-9 h-9 rounded-xl border transition-all duration-300 cursor-crosshair flex items-center justify-center hover:scale-110 hover:z-20 ${getIntensityColor(day.maxScore)}`}
                        >
                           {day.maxScore > 0.8 && <ShieldCheck size={14} className="text-white" />}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="glass border-white/10 p-3 shadow-2xl rounded-2xl">
                        <div className="space-y-1.5 min-w-[140px]">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{new Date(day.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                          <div className="flex items-center justify-between gap-4">
                             <span className="text-[12px] font-bold">Risk Intensity</span>
                             <span className={`text-[12px] font-black ${day.maxScore > 0.6 ? 'text-primary' : 'text-foreground'}`}>{Math.round(day.maxScore * 100)}%</span>
                          </div>
                          <div className="pt-1.5 border-t border-white/5 mt-1.5 flex flex-col gap-1">
                             <p className="text-[9px] text-muted-foreground flex justify-between uppercase font-black">Findings: <span className="text-foreground">{day.count}</span></p>
                             <p className="text-[9px] text-muted-foreground flex justify-between uppercase font-black">Top Risk: <span className={day.maxScore > 0.5 ? 'text-cost-amber' : 'text-cost-blue'}>{day.primaryRisk.toUpperCase()}</span></p>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </TooltipProvider>
        </div>

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-md bg-white/[0.05] border border-white/5" />
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Normal</span>
             </div>
             <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-md bg-cost-blue/30 border border-cost-blue/20" />
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Monitoring</span>
             </div>
             <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-md bg-cost-amber/40 border border-cost-amber/30" />
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Risk Zone</span>
             </div>
             <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-md bg-primary border border-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Critical</span>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
             <Info size={12} className="text-muted-foreground" />
             <p className="text-[9px] text-muted-foreground font-medium italic">Intensity weighted by daily max fuzzy score</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RefreshCw({ className, size }: { className?: string; size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
