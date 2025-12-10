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

app.get("/", (req, res) => {
  res.render("index", { quote: null });
});

app.post("/generate", async (req, res) => {
  try {
    const chatCompletion = await client.chat.completions.create({
      model: "openai/gpt-oss-20b:groq",
      messages: [
        {
          role: "user",
          content: "Generate a short motivational quote.",
        },
      ],
      temperature: 0.8,
      max_tokens: 60,
    });

    const quote = chatCompletion.choices[0].message.content.trim();

 //  Send quote to Zapier so Google Sheet gets a row
    await axios.post(ZAPIER_HOOK_URL, {
      quote,
      author: "Motiva",
      timestamp: new Date().toISOString(),
    });

    res.render("index", { quote });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.render("index", { quote: "Error: Could not generate quote." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
