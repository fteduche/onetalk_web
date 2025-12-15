const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const cors = require('cors')({ origin: true });

admin.initializeApp();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL; // e.g. "Onetalk <noreply@yourdomain.com>"
const DEFAULT_CONTINUE_URL = process.env.CONTINUE_URL || 'https://onetalk.co';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

exports.sendVerificationEmail = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    // Simple secret header check to prevent public abuse
    const FUNC_SECRET = process.env.FUNCTION_SECRET;
    if (FUNC_SECRET) {
      const provided = req.get('x-function-secret') || req.get('X-Function-Secret');
      if (!provided || provided !== FUNC_SECRET) {
        console.warn('Unauthorized function call attempt');
        return res.status(401).json({ error: 'unauthorized' });
      }
    }

    const { email, displayName, continueUrl } = req.body || {};
    if (!email) return res.status(400).json({ error: 'email is required' });

    try {
      const actionCodeSettings = {
        url: (continueUrl || DEFAULT_CONTINUE_URL),
        handleCodeInApp: false
      };

      const link = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);

      // If SendGrid not configured, return the link so client can fall back or log
      if (!SENDGRID_API_KEY || !FROM_EMAIL) {
        return res.json({ ok: true, link });
      }

      const msg = {
        to: email,
        from: FROM_EMAIL,
        subject: 'Verify your Onetalk email',
        html: `
          <p>Hi ${displayName || ''},</p>
          <p>Thanks for joining Onetalk. Please <a href="${link}">click here to verify your email</a>.</p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p><a href="${link}">${link}</a></p>
          <hr>
          <p>If you didn't sign up, you can safely ignore this message.</p>
        `
      };

      await sgMail.send(msg);
      return res.json({ ok: true });
    } catch (err) {
      console.error('sendVerificationEmail error', err);
      return res.status(500).json({ error: 'failed to create or send verification link' });
    }
  });
});
