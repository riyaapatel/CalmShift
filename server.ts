import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ 
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

const FALLBACK_STORIES: Record<string, { title: string; scenes: { text: string; visualPrompt: string }[]; quiz: { question: string; options: string[]; answer: string }[] }> = {
  History: {
    title: "The Historic Fountain Square Chronicles",
    scenes: [
      { text: "In 1872, Fountain Square became the vibrant heart of Bowling Green, featuring an iconic cast-iron fountain.", visualPrompt: "Historic fountain square in Bowling Green, 1800s vintage" },
      { text: "During the Civil War, Bowling Green briefly served as the Confederate Capital of Kentucky due to its strategic railway position.", visualPrompt: "Civil War era railway depot in Kentucky" },
      { text: "Western Kentucky University was established on the Hill, becoming a beacon of higher learning in South Central Kentucky.", visualPrompt: "WKU campus on top of a scenic hill with red brick buildings" },
      { text: "Today, Fountain Square remains surrounded by local coffee shops, historic theaters, and vibrant community gatherings.", visualPrompt: "Modern bustling Fountain Square park in downtown Bowling Green" }
    ],
    quiz: [
      { question: "In what year did Fountain Square get its iconic fountain?", options: ["1872", "1905", "1845", "1920"], answer: "1872" },
      { question: "What role did Bowling Green serve during the Civil War?", options: ["Union Capital", "Confederate Capital of KY", "Neutral Port", "Hospital Hub"], answer: "Confederate Capital of KY" },
      { question: "Where was Western Kentucky University established?", options: ["On the Hill", "By Lost River", "In Beech Bend", "Near the Cave"], answer: "On the Hill" }
    ]
  },
  Comedy: {
    title: "The Great Corvette Escape",
    scenes: [
      { text: "A local driver took a wrong turn at Beech Bend Raceway and accidentally ended up in the National Corvette Museum exhibit!", visualPrompt: "Red Corvette inside a museum exhibit hall surrounded by tourists" },
      { text: "Tourists cheered thinking it was a live interactive performance as the driver politely parallel parked next to a classic 1953 model.", visualPrompt: "Crowd of tourists applauding in a museum" },
      { text: "The museum guide gave him a 10/10 score for parking precision and offered him a job as chief demonstrator.", visualPrompt: "Museum curator handing a funny trophy to driver" },
      { text: "Now he leads the annual Corvette Parade, driving at a smooth 5 MPH with hazard lights blinking proudly.", visualPrompt: "Parade of sleek sports cars moving down Bowling Green street" }
    ],
    quiz: [
      { question: "Where did the driver accidentally take a wrong turn?", options: ["Beech Bend Raceway", "WKU Campus", "Lost River Cave", "I-65 Exit"], answer: "Beech Bend Raceway" },
      { question: "What year model was the classic Corvette he parked next to?", options: ["1953", "1967", "1984", "2020"], answer: "1953" },
      { question: "What job score did the museum guide give him?", options: ["10/10", "7/10", "5/10", "9/10"], answer: "10/10" }
    ]
  },
  Horror: {
    title: "Whispers of Lost River Cave",
    scenes: [
      { text: "Deep beneath Bowling Green, the underground river flows silently through limestone passages carved over millions of years.", visualPrompt: "Dark limestone underground cave river with faint eerie glow" },
      { text: "Legend says late-night boaters occasionally hear mysterious harmonies echoing off the ancient cave ceilings.", visualPrompt: "Wooden boat floating in dark underground cave water" },
      { text: "Subterranean acoustic resonance creates haunting echoes that sound remarkably like old bluegrass melodies.", visualPrompt: "Eerie mist hovering over cave river water" },
      { text: "The cavern tour guide smiles—it's just natural acoustic diffraction, but the spooky atmosphere remains unforgettable.", visualPrompt: "Tour guide holding a lantern in dark cave" }
    ],
    quiz: [
      { question: "What carves the passages in Lost River Cave?", options: ["Limestone river flow", "Glacial ice", "Volcanic lava", "Mining drills"], answer: "Limestone river flow" },
      { question: "What do late-night legends report hearing in the cave?", options: ["Mysterious harmonies", "Whistling winds", "Loud thunder", "Clock ticking"], answer: "Mysterious harmonies" },
      { question: "What actually creates the spooky echoes?", options: ["Acoustic diffraction", "Radio towers", "Cave bats", "Wind turbines"], answer: "Acoustic diffraction" }
    ]
  },
  Future: {
    title: "BG 2077 - Neon Speed & Stardust",
    scenes: [
      { text: "By 2077, Bowling Green has transformed into a futuristic hub where hover-Corvettes glide above illuminated skyways.", visualPrompt: "Futuristic city with flying neon sports cars and high-rise towers" },
      { text: "The WKU Innovation Dome projects real-time neural wellness fields, syncing every worker's stress levels automatically.", visualPrompt: "Glowing holographic dome over futuristic university campus" },
      { text: "Beech Bend now hosts zero-gravity anti-gravity racing tournaments under glowing aurora skies.", visualPrompt: "Anti-gravity hover vehicles racing on holographic track" },
      { text: "Workers take 5-minute cognitive micro-resets using neural-link screens, maintaining peak resilience across all shifts.", visualPrompt: "Person wearing sleek futuristic visor meditating in calm room" }
    ],
    quiz: [
      { question: "What glides above Bowling Green's skyways in 2077?", options: ["Hover-Corvettes", "Jetpacks", "Solar Zeppelins", "Teleporters"], answer: "Hover-Corvettes" },
      { question: "What does the WKU Innovation Dome project?", options: ["Neural wellness fields", "Weather shields", "Laser shows", "Ad banners"], answer: "Neural wellness fields" },
      { question: "How long are the futuristic cognitive micro-resets?", options: ["5 minutes", "30 minutes", "1 hour", "15 seconds"], answer: "5 minutes" }
    ]
  }
};

const FALLBACK_SUGGESTIONS = [
  { title: "Fountain Square Mindful Walk", description: "Take 10 minutes for slow pacing and deep breath synchronization.", points: 15 },
  { title: "Lost River Diaphragmatic Reset", description: "4-4-4-4 box breathing sequence to reduce shift stress.", points: 20 },
  { title: "Hydration & Alignment Break", description: "Drink 500ml water and perform gentle neck and shoulder releases.", points: 10 }
];

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API Route for Story Reels
  app.post("/api/reels", async (req, res) => {
    const { category } = req.body;
    const catName = category || "History";
    
    if (genAI) {
      try {
        const prompt = `Generate a short story for a "Reels" style scrolling game.
        LOCATION: Bowling Green, KY.
        CATEGORY: ${catName} (History, Comedy, Horror, or Future).
        
        The story must be told in 4 short "scenes" (max 30 words each).
        Then provide 3 multiple-choice questions based ONLY on the story details.
        
        Return JSON only:
        {
          "title": "A catchy title",
          "scenes": [
            { "text": "Text for scene 1", "visualPrompt": "Descriptive visual prompt for AI image generation" },
            { "text": "Text for scene 2", "visualPrompt": "Descriptive visual prompt" },
            { "text": "Text for scene 3", "visualPrompt": "Descriptive visual prompt" },
            { "text": "Text for scene 4", "visualPrompt": "Descriptive visual prompt" }
          ],
          "quiz": [
            { "question": "Q1 text", "options": ["Opt1", "Opt2", "Opt3", "Opt4"], "answer": "The correct option exactly" },
            { "question": "Q2 text", "options": ["Opt1", "Opt2", "Opt3", "Opt4"], "answer": "The correct option exactly" },
            { "question": "Q3 text", "options": ["Opt1", "Opt2", "Opt3", "Opt4"], "answer": "The correct option exactly" }
          ]
        }
        
        Make the story culturally relevant to Bowling Green (e.g., mentions of Western Kentucky University, Corvette Museum, Lost River Cave, Fountain Square).
        No extra text, just JSON.`;

        const response = await genAI.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{ parts: [{ text: prompt }] }],
        });
        
        const text = response.text || "";
        const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (parsed && Array.isArray(parsed.scenes) && parsed.scenes.length > 0) {
          return res.json(parsed);
        }
      } catch (error) {
        console.warn("Gemini API call failed, using fallback reels data:", error);
      }
    }

    const fallback = FALLBACK_STORIES[catName] || FALLBACK_STORIES.History;
    return res.json(fallback);
  });

  // API Route for AI Suggestions
  app.post("/api/suggestions", async (req, res) => {
    const { score, stressLevel } = req.body;
    
    if (genAI) {
      try {
        const prompt = `The user has a stress level of "${stressLevel}" based on a wellness game score of ${score}/100. 
        Suggest 3 personalized wellness activities for their daily calendar. 
        Return ONLY a JSON array of objects with keys: title, description, points (reward points for completing, e.g. 10, 20).
        Example: [{"title": "Quick Breathing", "description": "3 mins of box breathing", "points": 10}].
        Keep it positive and uplifting. No extra text, just JSON.`;

        const response = await genAI.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{ parts: [{ text: prompt }] }],
        });
        
        const text = response.text || "";
        const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
          return res.json(parsed);
        }
      } catch (error) {
        console.warn("Gemini API suggestions failed, using fallback:", error);
      }
    }

    return res.json(FALLBACK_SUGGESTIONS);
  });

  // API Route for Email Notification (Mock)
  app.post("/api/send-doctor-email", async (req, res) => {
    try {
      const { doctorEmail, doctorName, userName, userEmail, userMessage, resilienceData } = req.body;
      
      console.log("--- DISPATCHING EMAIL ---");
      console.log(`To: ${doctorName} (${doctorEmail})`);
      console.log(`From: ${userName} (${userEmail})`);
      console.log(`User Message: ${userMessage || "No message provided"}`);
      
      if (resilienceData) {
        console.log("Resilience Data Included:");
        resilienceData.forEach((d: any) => {
          console.log(`- [${d.date}] Score: ${d.score} | Analysis: ${d.analysis?.substring(0, 50)}...`);
        });
      } else {
        console.log("Resilience Data: NOT SHARED");
      }
      console.log("-------------------------");
      
      res.json({ success: true, message: `An email has been sent to ${doctorName}'s office.` });
    } catch (error) {
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // API Route for Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
