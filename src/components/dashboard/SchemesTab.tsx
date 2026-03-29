import { ALL_SCHEMES } from "@/lib/dashboard-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark, TrendingUp, ShieldCheck, FileText, RefreshCw, Star, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { StatutoryService, StatutoryIncentive } from "@/services/statutory-service";
import { toast } from "sonner";

export default function SchemesTab() {
  const [schemes, setSchemes] = useState<StatutoryIncentive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchemes();
  }, []);

  async function loadSchemes() {
    try {
      const data = await StatutoryService.getStatutoryIncentives();
      if (data && data.length > 0) {
        setSchemes(data);
      } else {
        // High-fidelity fallback
        setSchemes(ALL_SCHEMES.map(s => ({
          name: s.name,
          description: s.description,
          impact_estimate: s.impact,
          type: s.type,
          status: s.status.toLowerCase() as any
        })));
      }
    } catch (err) {
      toast.error("Failed to load statutory programs.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <RefreshCw className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h3 className="text-[15px] font-black text-foreground flex items-center gap-2 uppercase tracking-wider">
            <Landmark size={18} className="text-primary" />
            Statutory Incentives & Tax Optimization
          </h3>
          <p className="text-[11px] text-muted-foreground font-medium">Continous audit of government schemes and tax saving opportunities</p>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl uppercase tracking-widest font-bold">
          {schemes.length} programs available
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schemes.map((scheme, idx) => (
          <div key={idx} className="glass rounded-[2rem] border-white/5 shadow-2xl overflow-hidden hover:bg-white/[0.02] transition-all group flex flex-col">
            <div className="p-6 bg-white/5 border-b border-white/5 flex items-center justify-between">
               <Badge variant="secondary" className="text-[9px] uppercase font-black tracking-widest bg-primary/10 text-primary border-primary/20">
                  {scheme.type}
               </Badge>
               <div className="flex items-center gap-1.5 opacity-40">
                  <Star size={10} className="text-primary fill-primary" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">AI Curated</span>
               </div>
            </div>
            
            <div className="p-7 flex-1">
              <h4 className="text-[17px] font-black text-foreground group-hover:text-primary transition-colors tracking-tight flex items-center justify-between">
                {scheme.name}
                <ArrowUpRight size={18} className="text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </h4>
              <p className="text-[12px] text-muted-foreground leading-relaxed font-medium mt-2">
                {scheme.description}
              </p>
              
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-50 mb-1">Impact Baseline</span>
                  <span className="text-[18px] font-black text-cost-green font-mono tracking-tighter">{scheme.impact_estimate}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-50 mb-1">Audit Status</span>
                  <span className={`text-[11px] font-black tracking-widest uppercase flex items-center gap-2 ${
                    scheme.status === "active" ? "text-cost-green" : 
                    scheme.status === "eligible" ? "text-primary shadow-primary/20" : 
                    "text-cost-amber"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      scheme.status === "active" ? "bg-cost-green shadow-[0_0_8px_rgba(34,197,94,0.6)]" : 
                      scheme.status === "eligible" ? "bg-primary shadow-[0_0_8px_rgba(99,102,241,0.6)]" : 
                      "bg-cost-amber shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                    }`}></span>
                    {scheme.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
