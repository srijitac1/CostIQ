import { LayoutDashboard, AlertTriangle, Shield, Server, Clock, Receipt, BookOpen, Settings } from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "anomalies", label: "Anomalies", icon: AlertTriangle },
  { id: "compliance", label: "Compliance", icon: Shield },
  { id: "resources", label: "Resources", icon: Server },
  { id: "sla", label: "SLA", icon: Clock },
  { id: "finops", label: "FinOps", icon: Receipt },
  { id: "ledger", label: "Ledger", icon: BookOpen },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

interface Props {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export default function DashboardSidebar({ activeTab, setActiveTab }: Props) {
  return (
    <aside className="w-[220px] bg-card border-r border-border flex flex-col shrink-0 h-screen sticky top-0">
      <div className="h-[60px] flex items-center px-5 border-b border-border">
        <div className="flex items-baseline gap-0.5">
          <span className="font-display text-[18px] font-black text-primary">Cost</span>
          <span className="font-display text-[18px] font-bold text-foreground">IQ</span>
          <span className="text-[11px] text-muted-foreground font-mono ml-0.5">.ai</span>
        </div>
      </div>
      <nav className="flex-1 py-3 px-3 space-y-0.5">
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-[13px] font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
              {tab.label}
            </button>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground font-mono">CostIQ v1.0 · Private Beta</p>
      </div>
    </aside>
  );
}
