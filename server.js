require("dotenv").config();
const express = require("express");
const path = require("path");
const OpenAI = require("openai");
const axios = require("axios");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
});

const ZAPIER_HOOK_URL = process.env.ZAPIER_WEBHOOK_URL;

// Render main page
app.get("/", (req, res) => {
  res.render("index");
});

// API route for chat
app.post("/api/quote", async (req, res) => {
  try {
    const userMessage = req.body.message?.trim() || "";

    // ✅ Conditional logic: only generate quote if user asks
    if (/quote|motivational|inspire|positivity/i.test(userMessage)) {
      const chatCompletion = await client.chat.completions.create({
        model: "openai/gpt-oss-20b:groq",
        messages: [
          { role: "user", content: "Generate a short motivational quote." }
        ],
        temperature: 0.8,
        max_tokens: 80,
      });

      const quote =
        chatCompletion.choices?.[0]?.message?.content?.trim() ||
        "✨ Keep going. Every step forward matters.";

      // send to Zapier
      if (ZAPIER_HOOK_URL) {
        try {
          await axios.post(ZAPIER_HOOK_URL, {
            quote,
            author: "Motiva",
            timestamp: new Date().toISOString(),
          });
        } catch (zapError) {
          console.error("Zapier hook error:", zapError.message);
        }
      }

      return res.json({ quote });
    }

    // Default response for other messages
    res.json({ quote: "💬 I can share a motivational quote if you ask me!" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to generate quote" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
