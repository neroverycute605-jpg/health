import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '1mb' }));

// Shared Gemini AI client with required User-Agent header
const getGeminiAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API Route: Health & AI Medical Wellness Analysis
app.post('/api/health-analysis', async (req, res) => {
  try {
    const { bpm, temperature, activityState, userProfile, symptoms, question, history } = req.body;

    const ai = getGeminiAI();

    const systemInstruction = `
คุณคือ "PulseTemp AI Doctor" ผู้เชี่ยวชาญด้านสุขภาพและการประเมินสัญญาณชีพ (Vital Signs Advisor)
ให้คำปรึกษาและคำแนะนำทางสุขภาพภาษาไทยที่เข้าใจง่าย นุ่มนวล สุภาพ และอ้างอิงหลักการแพทย์อย่างสมเหตุสมผล

หน้าที่ของคุณ:
1. ประเมินความสัมพันธ์ระหว่าง อัตราการเต้นของหัวใจ (Heart Rate - BPM) และ อุณหภูมิร่างกาย (Body Temp - °C)
2. วิเคราะห์ตามบริบทกิจกรรม (${activityState || 'พักผ่อน'}) และประวัติสุขภาพของผู้ใช้
3. ระบุระดับความเสี่ยง/ระดับความเครียด (ปกติ / ควรระวัง / ความเสี่ยงสูง)
4. ให้คำแนะนำการดูแลตัวเอง เช่น การดื่มน้ำ การพักผ่อน การฝึกหายใจ หรือการพบแพทย์
5. ตอบคำถามสุขภาพเพิ่มเติมหากผู้ใช้ถามเข้ามา

**สำคัญ**: ให้ใส่ข้อความเตือนความรับผิดชอบสั้นๆ ว่า "คำแนะนำนี้เป็นเพียงข้อมูลเบื้องต้นจาก AI ไม่สามารถทดแทนการวินิจฉัยทางการแพทย์โดยแพทย์จริงได้" ไว้ที่ตอนท้ายเสมอ

โปรดส่งคืนข้อมูลเป็นรูปแบบ JSON ตามโครงสร้างนี้เสมอ:
{
  "overallAssessment": "สรุปภาพรวมภาวะสุขภาพสั้นๆ 1-2 ประโยค",
  "statusLevel": "normal" | "warning" | "alert",
  "heartRateAnalysis": "วิเคราะห์อัตราการเต้นของหัวใจเทียบกับเกณฑ์มาตรฐานตามอายุและกิจกรรม",
  "temperatureAnalysis": "วิเคราะห์อุณหภูมิร่างกาย (ไข้/ปกติ/เย็น)",
  "stressAndHrvIndex": "คะแนนประเมินความเครียด 1-100 พร้อมคำอธิบาย",
  "recommendations": ["คำแนะนำข้อที่ 1", "คำแนะนำข้อที่ 2", "คำแนะนำข้อที่ 3"],
  "emergencyAdvice": "คำแนะนำหากเกิดภาวะฉุกเฉิน หรือ null ถ้าไม่มี",
  "detailedExplanation": "คำอธิบายเชิงลึกภาษาไทย พร้อมข้อระวัง"
}
`;

    const promptText = `
ข้อมูลสัญญาณชีพที่วัดได้ล่าสุด:
- อัตราการเต้นของหัวใจ (Heart Rate): ${bpm ? `${bpm} BPM` : 'ไม่ได้วัด'}
- อุณหภูมิร่างกาย (Body Temp): ${temperature ? `${temperature} °C` : 'ไม่ได้วัด'}
- สถานะ/กิจกรรม: ${activityState || 'พักผ่อนปกติ'}
- อาการแทรกซ้อนที่ระบุ: ${symptoms && symptoms.length > 0 ? symptoms.join(', ') : 'ไม่มี'}
- ข้อมูลผู้ใช้: อายุ ${userProfile?.age || 30} ปี, เพศ ${userProfile?.gender || 'ไม่ระบุ'}, น้ำหนัก ${userProfile?.weight || 60} kg
${question ? `- คำถามเพิ่มเติมจากผู้ใช้: "${question}"` : ''}
${history && history.length > 0 ? `- ประวัติการวัด 3 ครั้งล่าสุด: ${JSON.stringify(history.slice(0, 3))}` : ''}

โปรดวิเคราะห์ผลสัญญาณชีพและส่งคำแนะนำกลับมาตามโครงสร้าง JSON ที่กำหนด
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(rawText);
    } catch {
      parsedResult = {
        overallAssessment: rawText,
        statusLevel: 'normal',
        heartRateAnalysis: `อัตราการเต้นหัวใจ: ${bpm} BPM`,
        temperatureAnalysis: `อุณหภูมิ: ${temperature} °C`,
        stressAndHrvIndex: '45/100 (ปกติ)',
        recommendations: [
          'ดื่มน้ำสะอาดอย่างน้อย 8 แก้วต่อวัน',
          'พักผ่อนให้เพียงพอ 7-8 ชั่วโมง',
          'หากรู้สึกเวียนศีรษะหรือมีไข้สูงเกิน 38.5°C ควรรีบพบแพทย์',
        ],
        detailedExplanation: rawText,
      };
    }

    res.json({ success: true, data: parsedResult });
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze health data',
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'PulseTemp Health API' });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PulseTemp Health Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
