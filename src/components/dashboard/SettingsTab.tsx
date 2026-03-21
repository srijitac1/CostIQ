import { INTEGRATIONS_LIST } from "@/lib/dashboard-data";
import { useState } from "react";

export default function SettingsTab() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS_LIST);

  function toggleConnect(id: string) {
    setIntegrations(list =>
      list.map(i => i.id === id ? { ...i, connected: !i.connected } : i)
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <h3 className="text-sm font-semibold text-foreground">Integrations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {integrations.map(i => (
          <div key={i.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded flex items-center justify-center text-base" style={{ background: i.col + "18", color: i.col }}>
                {i.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{i.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{i.desc}</p>
              </div>
            </div>
            <button
              onClick={() => toggleConnect(i.id)}
              className={`text-xs font-medium px-3 py-1.5 rounded transition-colors ${
                i.connected
                  ? "bg-cost-green/15 text-cost-green"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {i.connected ? "Connected" : "Connect"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
