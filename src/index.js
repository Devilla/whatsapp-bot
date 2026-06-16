require("dotenv").config();

const express = require("express");
const { handleIncomingMessage } = require("./handlers/messageHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

function requireEnv(name) {
  if (!process.env[name]) {
    console.warn(`Warning: ${name} is not set. Copy .env.example to .env and fill in your credentials.`);
  }
}

requireEnv("WHATSAPP_TOKEN");
requireEnv("WHATSAPP_PHONE_NUMBER_ID");
requireEnv("WEBHOOK_VERIFY_TOKEN");

// Meta webhook verification (GET)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log("Webhook verified");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Incoming WhatsApp messages (POST)
app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (!value?.messages?.length) {
      return;
    }

    const phoneNumberId = value.metadata.phone_number_id;
    const message = value.messages[0];

    console.log(`Message from ${message.from}: type=${message.type}`);

    await handleIncomingMessage(phoneNumberId, message);
  } catch (error) {
    console.error("Error handling webhook:", error);
  }
});

app.get("/", (_req, res) => {
  res.send("Medical Shop WhatsApp Bot is running. Webhook: POST /webhook");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
});
