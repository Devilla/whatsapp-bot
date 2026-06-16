const WHATSAPP_API = "https://graph.facebook.com/v21.0";

async function sendMessage(phoneNumberId, to, payload) {
  const token = process.env.WHATSAPP_TOKEN;
  const url = `${WHATSAPP_API}/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      ...payload,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp API error (${response.status}): ${error}`);
  }

  return response.json();
}

async function sendText(phoneNumberId, to, body) {
  return sendMessage(phoneNumberId, to, {
    type: "text",
    text: { body },
  });
}

async function sendPrescriptionPrompt(phoneNumberId, to) {
  return sendMessage(phoneNumberId, to, {
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text:
          "Welcome to our Medical Shop! 👋\n\n" +
          "How can we help you today?\n\n" +
          "Tap the button below to upload your prescription. " +
          "You can send a photo or PDF document.",
      },
      action: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: "upload_prescription",
              title: "Upload Prescription",
            },
          },
        ],
      },
    },
  });
}

async function sendPrescriptionInstructions(phoneNumberId, to) {
  return sendText(
    phoneNumberId,
    to,
    "Please upload your prescription now.\n\n" +
      "📎 Tap the attachment icon and send:\n" +
      "• A clear photo of your prescription, or\n" +
      "• A PDF document\n\n" +
      "Our pharmacist will review it and get back to you shortly."
  );
}

async function sendPrescriptionReceived(phoneNumberId, to) {
  return sendText(
    phoneNumberId,
    to,
    "✅ Thank you! We have received your prescription.\n\n" +
      "Our team is reviewing it and will confirm your order shortly.\n\n" +
      "Reply *HI* anytime to start again."
  );
}

async function downloadMedia(mediaId) {
  const token = process.env.WHATSAPP_TOKEN;

  const metaResponse = await fetch(`${WHATSAPP_API}/${mediaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!metaResponse.ok) {
    throw new Error(`Failed to get media URL: ${await metaResponse.text()}`);
  }

  const { url } = await metaResponse.json();

  const fileResponse = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!fileResponse.ok) {
    throw new Error(`Failed to download media: ${await fileResponse.text()}`);
  }

  return {
    buffer: Buffer.from(await fileResponse.arrayBuffer()),
    mimeType: fileResponse.headers.get("content-type"),
  };
}

module.exports = {
  sendText,
  sendPrescriptionPrompt,
  sendPrescriptionInstructions,
  sendPrescriptionReceived,
  downloadMedia,
};
