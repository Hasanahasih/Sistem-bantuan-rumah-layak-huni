import express from "express";
import path from "path";
import cors from "cors";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Gemini AI setup
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// SMTP Transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// API Routes
app.post("/api/ai/analyze-rtlh", async (req, res) => {
  try {
    const { applicationData } = req.body;
    
    const prompt = `
      Anda adalah pakar penilaian Rumah Tidak Layak Huni (RTLH).
      Analisis data pendaftar berikut dan berikan skor dari 0-100 (100 = sangat layak dibantu) 
      serta alasan singkat dalam format JSON.
      
      Data Pendaftar:
      - Nama: ${applicationData.applicantName}
      - Kondisi Fondasi: ${applicationData.housingConditions?.foundation}
      - Kondisi Dinding: ${applicationData.housingConditions?.walls}
      - Kondisi Atap: ${applicationData.housingConditions?.roof}
      - Kondisi Lantai: ${applicationData.housingConditions?.floor}
      - Pendapatan: ${applicationData.income}
      - Tanggungan: ${applicationData.dependents}
      
      Output JSON format:
      {
        "score": number,
        "analysis": "string"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/email/notify", async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    
    if (!process.env.SMTP_USER) {
      console.log("Email simulated (no SMTP credentials):", { to, subject, body });
      return res.json({ success: true, message: "Email simulated" });
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html: body,
    });

    res.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error("Email Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite Middleware
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
