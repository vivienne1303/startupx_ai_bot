require("dotenv").config();

const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PORT = process.env.PORT || 8080;

let messageCount = 0;

/* =========================
   WEBHOOK VERIFICATION
========================= */

app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "startupx_verify_123";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    console.log("Instagram Webhook Verified");
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

/* =========================
   INSTAGRAM WEBHOOK EVENTS
========================= */

app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    if (body.object === "instagram") {
      for (const entry of body.entry) {
        for (const event of entry.messaging || []) {
          if (event.message && event.message.text) {
            const senderId = event.sender.id;
            const userMessage = event.message.text;

            console.log("Instagram Message:", userMessage);

            const response = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: `
You are StartupX AI, a friendly and helpful AI assistant.

Important knowledge:
- X Corp refers to X Corp Edutech in Singapore.
- X Corp Edutech is an education technology company.
- Website: https://www.xcorp.sg
- Focus on startups, AI, education, Web3, innovation, and student learning.
- Keep replies modern, concise, friendly, and conversational.
                  `,
                },
                {
                  role: "user",
                  content: userMessage,
                },
              ],
            });

            const aiReply =
              response.choices[0].message.content ||
              "Sorry, I could not generate a reply.";

            await sendInstagramMessage(senderId, aiReply);
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook Error:", error.message);
    res.sendStatus(500);
  }
});

/* =========================
   SEND INSTAGRAM MESSAGE
========================= */

async function sendInstagramMessage(recipientId, messageText) {
  try {
    await fetch(
      `https://graph.instagram.com/v25.0/me/messages?access_token=${process.env.INSTAGRAM_PAGE_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: {
            id: recipientId,
          },
          message: {
            text: messageText,
          },
        }),
      }
    );

    console.log("Instagram reply sent");
  } catch (error) {
    console.error("Instagram send error:", error.message);
  }
}

// /* =========================
//    TELEGRAM COMMANDS
// ========================= */

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🚀 Hi, I’m StartupX AI — your AI-powered assistant."
  );
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `🤖 StartupX AI Commands

/xcorp - Learn about X Corp
/grants - View Singapore startup grants
/founder - Founder support
/viral - Viral content idea
/rules - Community rules
/growth - Ecosystem growth tracking

You can also chat normally with me like an AI.`
  );
});

bot.onText(/\/xcorp/, (msg) => {
  bot.sendMessage(msg.chat.id, "🏢 Learn more about X Corp Edutech:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🌐 Visit Website", url: "https://www.xcorp.sg" }],
      ],
    },
  });
});

bot.onText(/\/grants/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `🇸🇬 Singapore Startup Grants

1. Startup SG Founder
2. Startup SG Tech
3. Enterprise Development Grant
4. Productivity Solutions Grant
5. Market Readiness Assistance`
  );
});

bot.onText(/\/founder/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `🧠 Founder Questions

1. What problem are you solving?
2. Who are you helping?
3. Why is this urgent?
4. What is your solution?
5. How will you get users?`
  );
});

bot.onText(/\/viral/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `🔥 Viral Content Idea

"Most startups don’t fail because of bad ideas. They fail because they build without users."`
  );
});

bot.onText(/\/rules/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `📌 Community Rules

1. Be respectful
2. No spam
3. No scams
4. Share useful knowledge
5. Support builders`
  );
});

bot.onText(/\/growth/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `📊 Ecosystem Growth

Messages tracked: ${messageCount}`
  );
});

/* =========================
   TELEGRAM AI CHAT
========================= */

bot.on("message", async (msg) => {
  if (!msg.text) return;

  messageCount++;

  if (msg.text.startsWith("/")) return;

  try {
    bot.sendChatAction(msg.chat.id, "typing");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are StartupX AI, a friendly and helpful AI assistant.

Important knowledge:
- X Corp refers to X Corp Edutech in Singapore.
- Website: https://www.xcorp.sg
- Community focuses on startups, AI, education, Web3, and innovation.
- Keep replies concise and conversational.
          `,
        },
        {
          role: "user",
          content: msg.text,
        },
      ],
    });

    const aiReply = response.choices[0].message.content;

    bot.sendMessage(msg.chat.id, aiReply);
  } catch (error) {
    console.error("OpenAI error:", error.message);

    bot.sendMessage(
      msg.chat.id,
      "⚠️ Sorry, I had trouble generating a reply."
    );
  }
});

bot.on("polling_error", (error) => {
  console.error("Polling error:", error.message);
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("StartupX AI bot is running...");
});