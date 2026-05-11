require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let messageCount = 0;

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🚀 Hi, I’m StartupX AI — your AI-powered Telegram assistant."
  );
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `🤖 StartupX AI Commands

/xcorp - Learn about X Corp
/grants - View Singapore startup grants summary
/founder - Founder support
/viral - Generate viral content idea
/rules - Community rules
/growth - Ecosystem growth tracking

You can also chat with me normally like an AI.`
  );
});

bot.onText(/\/xcorp/, (msg) => {
  bot.sendMessage(msg.chat.id, "🏢 Learn more about X Corp Edutech below:", {
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
    `🇸🇬 Singapore Startup Grants Summary

1. Startup SG Founder
2. Startup SG Tech
3. Enterprise Development Grant
4. Productivity Solutions Grant
5. Market Readiness Assistance Grant
6. Startup SG Equity
7. IMDA Programmes
8. SkillsFuture Enterprise Credit`
  );
});

bot.onText(/\/founder/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `🧠 Founder Support

Ask yourself:
1. What problem are you solving?
2. Who are you helping?
3. Why is this urgent?
4. What is your solution?
5. How will you get your first users?`
  );
});

bot.onText(/\/viral/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `🔥 Viral Content Idea

Hook:
"Most startups do not fail because of bad ideas. They fail because they build without users."

Structure:
Hook → Problem → Lesson → Call-to-action`
  );
});

bot.onText(/\/rules/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `📌 Community Rules

1. Be respectful
2. No spam
3. No scams
4. Share useful startup or Web3 knowledge
5. Support other builders`
  );
});

bot.onText(/\/growth/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `📊 Ecosystem Growth

Messages tracked: ${messageCount}`
  );
});

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
You are StartupX AI, a friendly and helpful Telegram AI assistant.

Important knowledge:
- X Corp refers to X Corp Edutech in Singapore.
- X Corp Edutech is an education technology company.
- Website: https://www.xcorp.sg
- The community focuses on startups, AI, education, Web3, innovation, and student learning.
- If users ask about X Corp, explain X Corp Edutech and do not confuse it with Elon Musk's X.
- Be friendly, modern, and supportive.
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
      "⚠️ Sorry, I had trouble generating a reply. Please try again."
    );
  }
});

bot.on("polling_error", (error) => {
  console.error("Polling error:", error.message);
});

console.log("StartupX AI bot is running...");