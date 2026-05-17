import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Initialize Gemini
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Routes
  app.post("/api/analyze", async (req, res) => {
    const { text, url } = req.body;

    try {
      let contentToAnalyze = text;

      if (url && !text) {
        // Simple manual fetch as fallback/complement to urlContext
        try {
          const response = await axios.get(url, { headers: { 'User-Agent': 'VeriTrust-Bot/1.0' } });
          const $ = cheerio.load(response.data);
          // Simple extraction: title + main text
          const title = $("title").text();
          const body = $("p").map((i, el) => $(el).text()).get().join("\n");
          contentToAnalyze = `Title: ${title}\n\nContent: ${body}`;
        } catch (fetchError) {
          console.error("Failed to fetch URL manually:", fetchError);
          // If manual fetch fails, we'll rely on urlContext tool in Gemini
          contentToAnalyze = `Analyze content from this URL: ${url}`;
        }
      }

      if (!contentToAnalyze) {
        return res.status(400).json({ error: "No text or URL provided." });
      }

      const prompt = `Act as an expert fact-checker and NLP analyst. 
      Analyze the provided news content for:
      1. Factual accuracy of main claims.
      2. Political and ideological bias.
      3. Sentiment and sensationalism (clickbait factor).
      4. Sophistication of language and potential logical fallacies.
      
      Compare the content against generally accepted facts and identify trusted sources that provide verification or context.
      
      Content to analyze: ${contentToAnalyze}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              credibilityScore: { 
                type: Type.NUMBER, 
                description: "Score from 0 (Fake/Extremely Unreliable) to 100 (Highly Credible/Verified)." 
              },
              verdict: { 
                type: Type.STRING, 
                description: "A short verdict (e.g., 'Likely Authentic', 'High Bias', 'False Claims')." 
              },
              biasAnalysis: {
                type: Type.OBJECT,
                properties: {
                  rating: { type: Type.STRING, description: "Bias level (e.g., 'Minimal', 'Left-Leaning', 'Right-Leaning', 'Extreme')." },
                  explanation: { type: Type.STRING }
                },
                required: ["rating", "explanation"]
              },
              nlpBreakdown: {
                type: Type.OBJECT,
                properties: {
                  sentiment: { type: Type.STRING, description: "Sentiment detected (e.g., 'Aggressive', 'Neutral', 'Sensationalist')." },
                  sophistication: { type: Type.STRING, description: "Complexity of language used." },
                  logicalFallacies: { type: Type.ARRAY, items: { type: Type.STRING } },
                  propagandaLikelihood: { type: Type.NUMBER, description: "0-100 score of how much propaganda techniques are detected." },
                  emotionalIntensity: { type: Type.NUMBER, description: "0-100 score of emotional trigger words vs factual content." },
                  lexicalDensity: { type: Type.NUMBER, description: "0-100 score measuring information density." }
                },
                required: ["sentiment", "sophistication", "logicalFallacies", "propagandaLikelihood", "emotionalIntensity", "lexicalDensity"]
              },
              factualChecks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    claim: { type: Type.STRING },
                    status: { type: Type.STRING, enum: ["Verified", "Contested", "False", "Unverifiable"] },
                    details: { type: Type.STRING }
                  },
                  required: ["claim", "status", "details"]
                }
              },
              trustedSources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    url: { type: Type.STRING },
                    reason: { type: Type.STRING, description: "Why this source is relevant for comparison." }
                  },
                  required: ["name", "url", "reason"]
                }
              }
            },
            required: ["credibilityScore", "verdict", "biasAnalysis", "nlpBreakdown", "factualChecks", "trustedSources"]
          },
          tools: [{ urlContext: {} }]
        }
      });

      const analysisRaw = response.text;
      const analysis = JSON.parse(analysisRaw);
      res.json(analysis);

    } catch (error: any) {
      console.error("Analysis failed:", error);
      res.status(500).json({ error: error?.message || "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
