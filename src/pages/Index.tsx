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

const Index = () => (
  <>
    <Navbar />
    <Hero />
    <Ticker />
    <Stats />
    <AgentsSection />
    <TrustKitSection />
    <HowItWorks />
    <Pricing />
    <Testimonials />
    <CtaBanner />
    <Footer />
  </>
);

export default Index;
