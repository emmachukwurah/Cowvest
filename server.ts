import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini API
let genAI: GoogleGenAI | null = null;
function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    genAI = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAI;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/market-analysis", async (req, res) => {
  try {
    const { produceType } = req.body;
    const ai = getGenAI();
    
    const prompt = `Provide a concise market analysis for cow-related produce or service: ${produceType}. 
    Focus on beef, dairy, or leather investment potential in the next 6 months. 
    Format as JSON: { "summary": "...", "riskLevel": "Low/Medium/High", "trend": "Up/Down/Stable" }`;
    
    const result = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });
    
    const text = result.text;
    if (!text) throw new Error("Empty response from AI");
    
    // Clean JSON from markdown if exists
    const cleanedText = text.replace(/```json|```/g, "").trim();
    res.json(JSON.parse(cleanedText));
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Real-time AI Automated Customer Support Live Chat API
app.post("/api/chat", async (req, res) => {
  try {
    const { message, conversationHistory = [], userContext = {} } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const systemInstruction = `You are "CowVest AI Assistant", the official friendly, professional, and knowledgeable 24/7 customer support virtual assistant for CowVest (Agricultural Fintech & Sustainable Livestock Investment Platform in Nigeria).

Your role is to assist both new visitors and existing investors in real time with prompt, accurate, reassuring, and concise information.

Key Platform Information & FAQ Knowledge Base:
1. What is CowVest?
- CowVest is a leading agricultural fintech platform empowering everyday Nigerians and global investors to fund verified, high-yield livestock farming and agro-processing projects.
- Farm operations include: Feedlot Bull Fattening, Dairy Herd Expansion, Genetic Calf Breeding & Ranching, and Commercial Beef & Leather Off-taking.

2. Investment Products & Returns:
- Bull Fattening (3-6 months cycle): 15% - 20% estimated ROI. Fast capital turnover.
- Dairy Cow Expansion (6-12 months cycle): 18% - 24% estimated ROI. Generates recurring dairy revenues.
- Calf Breeding & Ranching (9-12 months cycle): 22% - 28% estimated ROI. Premium pedigree genetics.
- Leather & Offal Processing (4-8 months cycle): 16% - 22% estimated ROI. Export & industrial manufacturing off-take.
- Minimum Investment: ₦50,000 (fractional) up to ₦100,000,000+ for institutional slots.

3. Deposits, Wallets & Withdrawals:
- Deposits: Instant funding via dedicated Nigerian Virtual Bank Accounts (Monnify / Paystack / Direct Transfer) in Naira (NGN / ₦).
- Withdrawals: Real-time automated bank payouts to any registered 2FA-verified Nigerian commercial bank account with zero hidden fees.
- Capital & ROI Payouts: Automatically credited to your CowVest Wallet upon investment cycle maturity, withdrawable immediately or compoundable.

4. KYC (Know Your Customer) & Security:
- Level 1 & 2 verification via Bank Verification Number (BVN) / National Identity Number (NIN) through NIBSS integration.
- Farm Security: All ranches and cattle herds are covered with comprehensive Agricultural Insurance against mortality, epidemics, theft, and natural hazards.
- Real-time IoT geofencing, veterinary quarantine protocols, and biometric microchipping on partner ranches in Kaduna, Oyo, and Ogun states.

5. Refer & Earn Referral Program:
- Tier 1 (Bronze, 1-4 referrals): 0.50% commission on referred friends' first investments.
- Tier 2 (Silver, 5-9 referrals): 0.75% commission.
- Tier 3 (Gold, 10+ referrals): 1.00% commission.
- Welcome Bonus for New Users: When registering with a referral code, new investors receive up to 0.25% (up to ₦2,500) bonus upon completing KYC and their first funded cycle.
- Monthly cap: Up to ₦50,000 per user. Payouts credited directly to wallet balance.

6. Become a Partner / Commercial Off-Takers:
- Supermarkets, meat processors, restaurant chains, and leather manufacturers can partner with CowVest for guaranteed wholesale supply contracts via the "Become a Partner" dashboard.

7. Customer Support Escalation:
- Live Chat Assistant available 24/7 in real time.
- Human Desk: support@cowvest.ng | Phone/WhatsApp: +234 800 COWEST | Hours: Mon-Fri 8:00 AM - 6:00 PM WAT.

Guidelines for your response:
- Be clear, welcoming, encouraging, and respectful.
- Format responses cleanly with brief bullet points or bold highlights where appropriate.
- Keep answers concise (2 to 4 short paragraphs or bulleted breakdown).
- If the user asks about specific user state (e.g. KYC, balance), refer them to their dashboard navigation.
- If user mentions they want to speak with a human, provide the official support contacts.
${userContext?.userName ? `Current User Name: ${userContext.userName}` : "Current User: Visitor / Prospective Investor"}
${userContext?.kycVerified !== undefined ? `KYC Status: ${userContext.kycVerified ? "Verified" : "Unverified"}` : ""}`;

    // Format chat history for Gemini contents
    const contents: any[] = [];
    if (Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-8)) {
        if (msg.role === "user" || msg.role === "assistant" || msg.role === "model") {
          contents.push({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content || msg.text || "" }],
          });
        }
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    try {
      const ai = getGenAI();
      const result = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      const responseText = result.text;
      if (!responseText) throw new Error("Empty response from AI model");

      return res.json({
        reply: responseText,
        source: "gemini-3.7-flash",
        timestamp: new Date().toISOString(),
      });
    } catch (geminiError: any) {
      console.warn("Gemini API fallback triggered:", geminiError?.message || geminiError);

      // Intelligent Local Rule-Based Fallback to guarantee 100% uptime for customers
      const lower = message.toLowerCase();
      let fallbackReply = "";

      if (lower.includes("roi") || lower.includes("return") || lower.includes("profit") || lower.includes("yield") || lower.includes("rate")) {
        fallbackReply = `📈 **CowVest Investment Returns (ROI):**\n\n• **Feedlot Bull Fattening (3-6 mos):** 15% – 20% ROI\n• **Dairy Herd Expansion (6-12 mos):** 18% – 24% ROI\n• **Genetic Calf Breeding (9-12 mos):** 22% – 28% ROI\n• **Leather & Offal Processing (4-8 mos):** 16% – 22% ROI\n\nAll returns are automatically credited alongside your capital to your CowVest Wallet upon cycle maturity. Minimum investment starts at **₦50,000**.`;
      } else if (lower.includes("deposit") || lower.includes("fund") || lower.includes("wallet") || lower.includes("paystack") || lower.includes("monnify")) {
        fallbackReply = `💳 **Depositing Funds into CowVest:**\n\n1. Click the **Deposit** button in your top navigation.\n2. Choose between **Instant Virtual Bank Transfer**, **Monnify**, or **Debit Card**.\n3. Make the transfer of your desired amount (minimum ₦1,000).\n4. Your CowVest wallet is credited immediately and ready for allocating to live cattle cycles!`;
      } else if (lower.includes("withdraw") || lower.includes("cash out") || lower.includes("bank account") || lower.includes("payout")) {
        fallbackReply = `🏦 **Withdrawing Your Funds:**\n\n• Click **Withdraw** in the top navigation bar.\n• Enter the amount you wish to withdraw.\n• Select your verified Nigerian commercial bank account.\n• Withdrawals are processed instantly (typically within 60 seconds) with **zero withdrawal fees**.`;
      } else if (lower.includes("kyc") || lower.includes("verify") || lower.includes("bvn") || lower.includes("nin") || lower.includes("identity")) {
        fallbackReply = `🛡️ **KYC Verification Requirements:**\n\nIn compliance with Central Bank of Nigeria (CBN) regulations and anti-money laundering standards:\n• Submit your **BVN** or **NIN** along with a valid Government ID (Driver's License, International Passport, or Voter's Card).\n• Verification is verified automatically within seconds.\n• Click the **Submit KYC** button in your banner or Settings to get verified today.`;
      } else if (lower.includes("refer") || lower.includes("invite") || lower.includes("bonus") || lower.includes("commission") || lower.includes("affiliate")) {
        fallbackReply = `🎁 **CowVest Refer & Earn Program:**\n\n• **Bronze Tier (1-4 friends):** 0.50% commission on your friend's first investment.\n• **Silver Tier (5-9 friends):** 0.75% commission.\n• **Gold Tier (10+ friends):** 1.00% commission.\n• **Friend Welcome Bonus:** Your invited friends receive up to **₦2,500** welcome reward upon KYC verification & first investment!\n• Track your earnings live in the **Referral Dashboard**!`;
      } else if (lower.includes("safe") || lower.includes("insurance") || lower.includes("risk") || lower.includes("secure") || lower.includes("loss")) {
        fallbackReply = `🔒 **Safety & Risk Protection:**\n\n• **Comprehensive Agricultural Insurance:** All cattle, feedlots, and ranches are insured against mortality, disease outbreaks, theft, and natural perils.\n• **Quarantine & Veterinary Protocols:** Daily inspections by certified veterinary doctors and 24/7 IoT biometric tracking.\n• **Licensed Custody:** Partner funds are held with NDIC-insured financial institutions.`;
      } else if (lower.includes("partner") || lower.includes("off-taker") || lower.includes("wholesale") || lower.includes("supermarket") || lower.includes("supplier")) {
        fallbackReply = `🤝 **Commercial Partner Program:**\n\nWe collaborate with bulk meat off-takers, supermarkets, hotel chains, and leather manufacturers across West Africa.\n• Navigate to the **Become a Partner** section on your dashboard.\n• Complete the application form with your company details and monthly supply requirements.\n• Our commercial team will contact you within 24 hours.`;
      } else if (lower.includes("human") || lower.includes("agent") || lower.includes("contact") || lower.includes("support") || lower.includes("call") || lower.includes("email") || lower.includes("whatsapp")) {
        fallbackReply = `📞 **Speak with CowVest Support Team:**\n\n• **Email:** support@cowvest.ng\n• **WhatsApp Support:** +234 800 269 8378\n• **Office Hours:** Monday – Friday, 8:00 AM to 6:00 PM (WAT)\n• **Headquarters:** Lagos & Kaduna Operations Hub, Nigeria.\n\nWould you like me to note down your inquiry for a priority callback?`;
      } else {
        fallbackReply = `👋 Hello! I am your **CowVest AI Assistant**. I can help you with:\n\n• 🐂 **Livestock investment plans & ROI calculations** (15% - 28%)\n• 💳 **Instant wallet deposits & zero-fee withdrawals**\n• 🛡️ **KYC verification & BVN/NIN guidelines**\n• 🎁 **Refer & Earn program bonus tiers**\n• 🤝 **Commercial wholesale partnerships**\n\nWhat specific question can I assist you with today?`;
      }

      return res.json({
        reply: fallbackReply,
        source: "cowvest-knowledge-engine",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err: any) {
    console.error("Chat endpoint error:", err);
    return res.status(500).json({ 
      error: "Internal server error",
      reply: "We are currently experiencing a high volume of inquiries. Please ask your question again or email support@cowvest.ng." 
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
