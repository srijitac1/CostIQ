import { User } from "@supabase/supabase-js";
import { LogOut, Bell } from "lucide-react";

interface Props {
  user: User | null;
  signOut: () => Promise<void>;
  activeTab: string;
}

const TAB_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  anomalies: "Anomalies",
  compliance: "Compliance",
  resources: "Resources",
  sla: "SLA Monitoring",
  finops: "FinOps",
  ledger: "Ledger",
  settings: "Settings",
};

export default function DashboardHeader({ user, signOut, activeTab }: Props) {
  return (
    <header className="h-[60px] border-b border-border flex items-center justify-between px-6 bg-card shrink-0">
      <h2 className="text-[15px] font-semibold text-foreground">{TAB_TITLES[activeTab] || "Dashboard"}</h2>
      <div className="flex items-center gap-4">
        <button className="text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell size={16} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-[11px] font-semibold text-primary">
              {(user?.user_metadata?.full_name || user?.email || "U").charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-[13px] text-muted-foreground hidden md:block max-w-[140px] truncate">
            {user?.user_metadata?.full_name || user?.email}
          </span>
        </div>
        <button onClick={signOut}
          className="text-muted-foreground hover:text-foreground transition-colors" title="Sign out">
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
