import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "");

const SYSTEM_PROMPT = `
You are Sri, the AI assistant for CostIQ.ai. 
CostIQ is an enterprise cost audit platform that uses autonomous agents to detect cost anomalies and fix leakage.

Your core expertise includes:
1. Indian Government Schemes for businesses (MSME Udyam, PLI Schemes, Startup India).
2. GST Optimization (Input Tax Credit, GSTR reconciliation, filing compliance).
3. Cloud Cost Optimization (AWS, GCP, Azure).
4. General SaaS spend management and compliance (SOC 2).

Style: Professional, concise, enterprise-grade, but helpful.
If asked about general news or history (like ChatGPT), feel free to answer, but always try to relate it back to business or cost efficiency if possible.

If the user asks about specific anomalies, assume they are looking at their CostIQ dashboard which tracks:
- Spend Anomalies (Duplicate SaaS, unused licenses)
- Resource Anomalies (Idle cloud instances)
- Compliance Gaps (SOC 2, ISO)
- Financial Ops (Invoice discrepancies)

Current Local Context: India.
`;

export async function streamGeminiChat({
  messages,
  context,
  onDelta,
  onDone,
  onError,
}: {
  messages: { role: "user" | "assistant"; content: string }[];
  context?: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const runSimulation = async (prefix = "[Simulated Fallback]") => {
    const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
    let mockResponse = `${prefix} I am operating in local simulation mode due to an API quota or missing key. Based on the local governance data, your compliance and spend architecture look stable. I recommend reviewing the latest anomalies in the Governance Control Center.`;
    
    if (lastUserMsg.includes("gap") || lastUserMsg.includes("compliance") || lastUserMsg.includes("soc") || lastUserMsg.includes("audit")) {
      mockResponse = `${prefix} Based on the TrustKit governance scan, I noticed non-conformities around logical access controls (CC6) and change management (CC8). Triggering an automated access review workflow is recommended to mitigate the revenue at risk.`;
    } else if (lastUserMsg.includes("cost") || lastUserMsg.includes("spend") || lastUserMsg.includes("save") || lastUserMsg.includes("finops")) {
      mockResponse = `${prefix} The FinOps and Spend agents have identified potential duplicate SaaS licenses (Slack, Figma) and oversized cloud resources (idle EC2 instances, orphaned EBS volumes). Remediating these can save over ₹70,000+ annually.`;
    }
    
    // Simulate natural streaming effect
    const words = mockResponse.split(" ");
    for (let i = 0; i < words.length; i++) {
        await new Promise(r => setTimeout(r, 60)); // 60ms delay per word
        onDelta(words[i] + " ");
    }
    onDone();
  };

  const runHuggingFace = async () => {
    try {
      const { HfInference } = await import("@huggingface/inference");
      const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
      const hf = new HfInference(HF_API_KEY);
      
      const hfMessages: any[] = [{ role: "system", content: context ? `${SYSTEM_PROMPT}\n\nCURRENT DASHBOARD CONTEXT:\n${context}` : SYSTEM_PROMPT }];
      
      messages.slice(0, -1).forEach(m => {
        hfMessages.push({ role: m.role, content: m.content });
      });
      hfMessages.push({ role: "user", content: messages[messages.length - 1].content });

      const stream = hf.chatCompletionStream({
        model: "Qwen/Qwen2.5-72B-Instruct",
        messages: hfMessages,
        max_tokens: 500,
      });

      for await (const chunk of stream) {
        if (chunk.choices && chunk.choices.length > 0) {
          onDelta(chunk.choices[0].delta.content || "");
        }
      }
      onDone();
      return true;
    } catch (hfError: any) {
      console.error("HuggingFace Fallback Error:", hfError);
      await runSimulation(`[HF Error: ${hfError.message}]`);
      return false; // Handled by simulation
    }
  };

  const hasGemini = API_KEY && API_KEY.trim() !== "";
  const hasHF = import.meta.env.VITE_HUGGINGFACE_API_KEY && import.meta.env.VITE_HUGGINGFACE_API_KEY.trim() !== "";

  if (!hasGemini && !hasHF) {
    await runSimulation();
    return;
  }

  if (!hasGemini && hasHF) {
     await runHuggingFace();
     return;
  }

  try {
    const fullPrompt = context 
      ? `${SYSTEM_PROMPT}\n\nCURRENT DASHBOARD CONTEXT:\n${context}`
      : SYSTEM_PROMPT;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction: fullPrompt 
    });

    const rawHistory = messages.slice(0, -1).map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const firstUserIdx = rawHistory.findIndex(m => m.role === "user");
    const validHistory = firstUserIdx >= 0 ? rawHistory.slice(firstUserIdx) : [];

    const chat = model.startChat({
      history: validHistory,
    });

    const result = await chat.sendMessageStream(messages[messages.length - 1].content);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        onDelta(chunkText);
      }
    }
    onDone();
  } catch (error: any) {
    console.warn("Gemini API Error (Routing to HuggingFace / Simulation):", error.message);
    if (hasHF) {
      await runHuggingFace();
    } else {
      await runSimulation();
    }
  }
}
