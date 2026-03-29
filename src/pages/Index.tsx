import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Ticker from "@/components/Ticker";
import Stats from "@/components/Stats";
import AgentsSection from "@/components/AgentsSection";
import TrustKitSection from "@/components/TrustKitSection";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import DashboardChatBot from "@/components/dashboard/DashboardChatBot";

const Index = () => {
  const [chatOpen, setChatOpen] = useState(false);
  
  return (
    <>
      <Navbar />
      <Hero />
      <Ticker />
      <Stats />
      <AgentsSection />
      <TrustKitSection />
      <HowItWorks />
      <Pricing />
      
      <CtaBanner />
      <Footer />
      <DashboardChatBot open={chatOpen} setOpen={setChatOpen} />
    </>
  );
};

export default Index;
