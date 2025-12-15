Send verification emails using Firebase Admin + SendGrid

Overview
- This function generates a Firebase email verification link using the Admin SDK and sends a small HTML email with an anchor (`Click here to verify your email`) via SendGrid.

Setup
1. In the `functions` directory run `npm install`.
2. Set environment variables before deploying:
   - `SENDGRID_API_KEY` - your SendGrid API key
   - `FROM_EMAIL` - verified from address (e.g. "Onetalk <noreply@yourdomain.com>")
   - `CONTINUE_URL` - optional, the URL to redirect users to after verification

Deploy (Firebase Functions)
1. Install Firebase CLI and login: `npm install -g firebase-tools` then `firebase login`.
2. Set a function secret (recommended) to prevent abuse:
   - `firebase functions:config:set sendverifier.secret="YOUR_SECRET_VALUE"`
   - Or set an environment variable `FUNCTION_SECRET` in your cloud functions runtime.
3. From the project root, deploy functions:
   - `cd functions`
   - `firebase deploy --only functions:sendVerificationEmail` (ensure env vars configured in Firebase project)

Deliverability (reduce spam rate)
1. Use SendGrid Domain Authentication (preferred):
   - In SendGrid, go to Settings → Sender Authentication → Authenticate Your Domain.
   - Follow steps to add DNS records (SPF, DKIM) to your domain.
2. If using a custom `FROM_EMAIL` on your domain, add the TXT/SPF/DKIM records SendGrid provides.
3. Ensure `FROM_EMAIL` is a verified sender in SendGrid.
4. Optionally enable DMARC for your domain.

Client usage
- Set `VITE_SEND_VERIFICATION_URL` to the HTTPS function URL (or your proxy) so the client can POST `{ email, displayName, continueUrl }`.
