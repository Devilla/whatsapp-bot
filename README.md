# Medical Shop WhatsApp Bot

A WhatsApp bot for a medical shop. When a customer sends **HI**, they get a button to upload their prescription. Uploaded files are saved locally for your team to review.

## How it works

```
Customer: HI
Bot:      Welcome message + [Upload Prescription] button

Customer: (taps button)
Bot:      Instructions to send photo or PDF

Customer: (sends prescription image/PDF)
Bot:      "Thank you! We received your prescription."
          → File saved to uploads/
```

## Setup

### 1. Create a Meta app

1. Go to [Meta for Developers](https://developers.facebook.com/) and create an app.
2. Add the **WhatsApp** product.
3. In **WhatsApp → API Setup**, note your:
   - **Phone number ID**
   - **Temporary access token** (later replace with a permanent System User token for production)

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```
WHATSAPP_TOKEN=your_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WEBHOOK_VERIFY_TOKEN=any_random_secret_string
PORT=3000
```

### 3. Install and run

```bash
npm install
npm run dev
```

### 4. Expose your local server (for development)

WhatsApp needs a public HTTPS URL. Use [ngrok](https://ngrok.com/):

```bash
ngrok http 3000
```

Copy the HTTPS URL (e.g. `https://abc123.ngrok.io`).

### 5. Register the webhook in Meta

1. In your Meta app → **WhatsApp → Configuration**
2. Set **Callback URL**: `https://your-ngrok-url/webhook`
3. Set **Verify token**: same value as `WEBHOOK_VERIFY_TOKEN` in your `.env`
4. Subscribe to the **messages** field
5. Click **Verify and save**

### 6. Test

Send **HI** to your WhatsApp test number from the Meta dashboard. You should see the welcome message and upload button.

## Project structure

```
src/
  index.js                  # Express server + webhook routes
  whatsapp.js               # Send messages via WhatsApp Cloud API
  handlers/
    messageHandler.js       # HI greeting, button, prescription upload logic
uploads/                    # Saved prescriptions (created automatically)
```

## Production notes

- Replace the temporary token with a **permanent System User token**
- Host on a server with HTTPS (Railway, Render, AWS, etc.)
- Add a database to track orders instead of only saving files locally
- Consider notifying your staff (email/SMS) when a new prescription arrives
