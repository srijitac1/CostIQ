import { LayoutDashboard, Shield, Server, Clock, Receipt, BookOpen, Settings, FolderOpen, FileText } from "lucide-react";

const TABS = [
  { id: "dashboard",  label: "Overview",        icon: LayoutDashboard },
  { id: "anomalies",  label: "Audit Findings",   icon: Shield          },
  { id: "compliance", label: "Compliance Hub",   icon: Shield          },
  { id: "resources",  label: "Cloud Governance", icon: Server          },
  { id: "sla",        label: "SLA Monitoring",   icon: Clock           },
  { id: "finops",     label: "Billing Audit",    icon: Receipt         },
  { id: "schemes",    label: "Incentives",       icon: BookOpen        },
  { id: "documents",  label: "Documents",        icon: FolderOpen      },
  { id: "reports",    label: "Audit Archive",    icon: FileText        },
  { id: "ledger",     label: "Ledger",           icon: FileText        },
  { id: "settings",   label: "Settings",         icon: Settings        },
] as const;

interface Props {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export default function DashboardSidebar({ activeTab, setActiveTab }: Props) {
  return (
    <aside className="w-[240px] glass-sidebar flex flex-col shrink-0 h-screen sticky top-0 z-40">
      <div className="h-[70px] flex items-center px-6 border-b border-white/5">
        <div className="flex items-baseline gap-0.5">
          <span className="font-display text-[20px] font-black text-primary">Cost</span>
          <span className="font-display text-[20px] font-bold text-foreground">IQ</span>
          <span className="text-[11px] text-muted-foreground font-mono ml-0.5 opacity-50">.ai</span>
        </div>
      </div>
      <nav className="flex-1 py-6 px-4 space-y-1">
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                active
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              {tab.label}
            </button>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-white/5 bg-white/5">
        <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-1">TrustKit</p>
        <p className="text-[9px] text-muted-foreground font-mono">v1.2 · Compliance Intelligence</p>
      </div>
    </aside>
  );
}
