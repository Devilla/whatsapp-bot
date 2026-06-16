const fs = require("fs");
const path = require("path");
const {
  sendText,
  sendPrescriptionPrompt,
  sendPrescriptionInstructions,
  sendPrescriptionReceived,
  downloadMedia,
} = require("../whatsapp");

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

function normalizeText(text) {
  return (text || "").trim().toLowerCase();
}

function isGreeting(text) {
  const normalized = normalizeText(text);
  return ["hi", "hello", "hey", "hii", "hola", "start"].includes(normalized);
}

function isPrescriptionMedia(message) {
  return message.type === "image" || message.type === "document";
}

async function savePrescription(from, message) {
  ensureUploadsDir();

  const media =
    message.type === "image" ? message.image : message.document;

  const { buffer, mimeType } = await downloadMedia(media.id);

  const extension =
    message.type === "document"
      ? path.extname(media.filename || ".pdf") || ".pdf"
      : mimeType?.includes("png")
        ? ".png"
        : ".jpg";

  const filename = `${from}_${Date.now()}${extension}`;
  const filepath = path.join(UPLOADS_DIR, filename);

  fs.writeFileSync(filepath, buffer);

  console.log(`Prescription saved: ${filepath} (${mimeType})`);
  return filepath;
}

async function handleIncomingMessage(phoneNumberId, message) {
  const from = message.from;

  // User tapped "Upload Prescription" button
  if (message.type === "interactive") {
    const buttonId = message.interactive?.button_reply?.id;
    if (buttonId === "upload_prescription") {
      await sendPrescriptionInstructions(phoneNumberId, from);
      return;
    }
  }

  // User sent a prescription photo or document
  if (isPrescriptionMedia(message)) {
    await savePrescription(from, message);
    await sendPrescriptionReceived(phoneNumberId, from);
    return;
  }

  // User sent text
  if (message.type === "text") {
    const text = message.text?.body;

    if (isGreeting(text)) {
      await sendPrescriptionPrompt(phoneNumberId, from);
      return;
    }

    await sendText(
      phoneNumberId,
      from,
      "Sorry, I didn't understand that.\n\nReply *HI* to get started and upload your prescription."
    );
  }
}

module.exports = { handleIncomingMessage };
