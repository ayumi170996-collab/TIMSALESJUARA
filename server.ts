import express from 'express';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const server = http.createServer(app);

// Gemini client initialization
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Proxy for Google Sheets Web App API (avoids browser CORS & handles Google 302 redirects)
app.get('/api/sheets-proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url as string;
    const action = (req.query.action as string) || 'all';

    if (!targetUrl || !targetUrl.trim()) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    const separator = targetUrl.includes('?') ? '&' : '?';
    const fullUrl = `${targetUrl}${separator}action=${encodeURIComponent(action)}`;

    console.log(`[Proxy] Fetching Google Sheets API from: ${fullUrl}`);
    const response = await fetch(fullUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Sheets responded with HTTP status ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    console.error('[Proxy] Failed to fetch Google Sheets:', err);
    res.status(500).json({
      error: `Failed to fetch Google Sheets: ${err.message || 'Unknown error'}`,
    });
  }
});

// AI Business Advisor & Operational Insight (Gemini 3.8 Flash)
app.post('/api/ai-advisor', async (req, res) => {
  try {
    const dashboardData = req.body;

    const prompt = `Anda adalah Executive Business & Sales Strategy Consultant untuk TimSalesJuara (PT Sinergi Unggul Indonesia).
Berikut adalah data operasional bisnis terkini dari dashboard:

${JSON.stringify(dashboardData, null, 2)}

Buat analisis eksekutif dan rekomendasi strategis dalam Bahasa Indonesia yang tajam, profesional, dan dapat langsung ditindaklanjuti:
1. Ringkasan Eksekutif: Evaluasi performa MTD (Revenue vs Target, Win rate, Pipeline health).
2. Klien Prioritas & Risiko: Identifikasi klien yang berada dalam status 'At Risk' atau pencapaian target <60%, serta akar masalah dan solusinya.
3. Rekomendasi Taktis 7 Hari ke Depan: 3-4 langkah konkret untuk tim (Ayumi, BGM, Direktur) guna mendorong closing pipeline dan menyelesaikan issue operasional.
4. Estimasi Closing Pipeline: Analisis deal terkuat di pipeline untuk menutup gap revenue.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            healthScore: { type: Type.INTEGER, description: 'Skor kesehatan operasional 0-100' },
            statusOverall: { type: Type.STRING },
            urgentRisks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  clientOrArea: { type: Type.STRING },
                  riskLevel: { type: Type.STRING },
                  analysis: { type: Type.STRING },
                  recommendedAction: { type: Type.STRING },
                },
                required: ['clientOrArea', 'riskLevel', 'analysis', 'recommendedAction'],
              },
            },
            strategicNextSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  action: { type: Type.STRING },
                  owner: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  expectedImpact: { type: Type.STRING },
                },
                required: ['action', 'owner', 'priority', 'expectedImpact'],
              },
            },
            pipelineInsight: { type: Type.STRING },
          },
          required: [
            'executiveSummary',
            'healthScore',
            'statusOverall',
            'urgentRisks',
            'strategicNextSteps',
            'pipelineInsight',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('AI Advisor error:', err);
    res.status(500).json({ error: err.message || 'Gagal menghasilkan analisis AI' });
  }
});

// Vite middleware or static serving
const isProduction = process.env.NODE_ENV === 'production';
if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`TimSalesJuara server listening on port ${PORT}`);
});
