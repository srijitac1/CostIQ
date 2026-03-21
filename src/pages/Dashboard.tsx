import { useState, useCallback, memo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardTab from "@/components/dashboard/DashboardTab";
import AnomaliesTab from "@/components/dashboard/AnomaliesTab";
import ComplianceTab from "@/components/dashboard/ComplianceTab";
import ResourcesTab from "@/components/dashboard/ResourcesTab";
import SlaTab from "@/components/dashboard/SlaTab";
import FinOpsTab from "@/components/dashboard/FinOpsTab";
import LedgerTab from "@/components/dashboard/LedgerTab";
import SettingsTab from "@/components/dashboard/SettingsTab";
import DashboardChatBot from "@/components/dashboard/DashboardChatBot";

const TABS = ["dashboard", "anomalies", "compliance", "resources", "sla", "finops", "ledger", "settings"] as const;
type Tab = typeof TABS[number];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [chatOpen, setChatOpen] = useState(false);

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardTab />;
      case "anomalies": return <AnomaliesTab />;
      case "compliance": return <ComplianceTab />;
      case "resources": return <ResourcesTab />;
      case "sla": return <SlaTab />;
      case "finops": return <FinOpsTab />;
      case "ledger": return <LedgerTab />;
      case "settings": return <SettingsTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader user={user} signOut={signOut} activeTab={activeTab} />
        <main className="flex-1 overflow-auto p-6">
          {renderTab()}
        </main>
      </div>
      <DashboardChatBot open={chatOpen} setOpen={setChatOpen} />
    </div>
  );
}
