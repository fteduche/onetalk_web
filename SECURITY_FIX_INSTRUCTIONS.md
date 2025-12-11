# URGENT: Firebase API Key Security Fix

## ✅ Steps Completed

1. **Removed hardcoded credentials from code** ✅
   - All Firebase credentials now ONLY use environment variables
   - No fallback values in the code
   - Changes committed and pushed to GitHub

2. **Verified .env protection** ✅
   - `.env` files properly listed in `.gitignore`
   - Will not be committed to repository

## 🚨 CRITICAL STEPS YOU MUST COMPLETE NOW

### Step 1: Regenerate Your Firebase API Key (REQUIRED)

The exposed API key `AIzaSyCpUOnfvYGWD-kP_MgUU5VcjGD5ZwhPUr8` **MUST** be regenerated immediately.

**Instructions:**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select project: `OneTalk (onetalk-c7121)`

2. **Navigate to Credentials**
   - Click the menu (☰) in the top-left
   - Go to: **APIs & Services** → **Credentials**

3. **Find the Exposed API Key**
   - Look for the API key: `AIzaSyCpUOnfvYGWD-kP_MgUU5VcjGD5ZwhPUr8`
   - Click on it to open the details

4. **Regenerate the Key**
   - Click the **"Regenerate Key"** button
   - Confirm the regeneration
   - **COPY THE NEW API KEY IMMEDIATELY** (you won't see it again)
   - Example new key format: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### Step 2: Add API Key Restrictions (REQUIRED)

**BEFORE closing the API key page:**

1. **Application Restrictions**
   - Select: **HTTP referrers (web sites)**
   - Add these referrers:
     ```
     https://onetalk.co/*
     https://www.onetalk.co/*
     http://localhost:3000/*
     https://*.onrender.com/*
     ```
   - Click **"Done"**

2. **API Restrictions**
   - Select: **Restrict key**
   - Enable only these APIs:
     - ✅ Firebase Authentication API
     - ✅ Cloud Firestore API
     - ✅ Identity Toolkit API
   - Click **"Save"**

### Step 3: Update Environment Variables

**Local Environment (.env file):**

1. Open your `.env` file
2. Replace the old API key with the NEW one:
   ```
   VITE_FIREBASE_API_KEY=YOUR_NEW_API_KEY_HERE
   ```
3. Save the file

**Render Production Environment:**

1. Go to: https://dashboard.render.com/
2. Select your site: `onetalk-web`
3. Click **"Environment"** in the left sidebar
4. Find: `VITE_FIREBASE_API_KEY`
5. Click **"Edit"**
6. Paste the **NEW API KEY**
7. Click **"Save Changes"**
8. Site will automatically redeploy

### Step 4: Verify Everything Works

1. **Test Locally:**
   ```bash
   npm run dev
   ```
   - Visit http://localhost:3000
   - Try to register a new account
   - Should work without errors

2. **Test Production:**
   - Wait for Render deployment to complete (~2-3 minutes)
   - Visit https://onetalk.co
   - Try to register a new account
   - Visit https://onetalk.co/admin
   - Login with admin credentials
   - Verify dashboard loads

### Step 5: Monitor for Abuse

1. **Check Google Cloud Console Logs**
   - Go to: **Logging** → **Logs Explorer**
   - Look for any suspicious API usage
   - Check for unexpected billing

2. **Review Firebase Authentication Logs**
   - Go to Firebase Console: https://console.firebase.google.com
   - Select: `onetalk-c7121`
   - Click **Authentication** → **Users**
   - Review recent sign-ups for suspicious activity

3. **Set Up Billing Alerts**
   - Go to: **Billing** → **Budgets & alerts**
   - Create alert for unusual spending

## 📋 Verification Checklist

- [ ] Regenerated Firebase API key in Google Cloud Console
- [ ] Added HTTP referrer restrictions (onetalk.co, localhost, etc.)
- [ ] Added API restrictions (Firebase Auth, Firestore, Identity Toolkit only)
- [ ] Updated `.env` file with new API key
- [ ] Updated Render environment variables with new API key
- [ ] Tested local development (npm run dev)
- [ ] Tested production site (https://onetalk.co)
- [ ] Verified registration works
- [ ] Verified admin login works
- [ ] Checked Google Cloud logs for abuse
- [ ] Set up billing alerts

## 🔒 Why This Happened

The API key was exposed because:
1. It was hardcoded in `index.tsx` with fallback values
2. The file was committed to GitHub
3. GitHub is public, making the credentials accessible

## 🛡️ Prevention for Future

This has been fixed by:
1. ✅ Removing ALL hardcoded credentials from code
2. ✅ Enforcing environment variables ONLY
3. ✅ `.env` files in `.gitignore`
4. ✅ API key restrictions (after you complete steps above)

## ⚠️ Important Notes

- **DO NOT** skip the API key regeneration - the old key is compromised
- **DO NOT** commit the new API key to GitHub
- **DO** add restrictions to limit key usage to your domains only
- **DO** monitor your Google Cloud billing for the next few days

## 🆘 Need Help?

If you encounter issues:
1. Check Firebase Console for error messages
2. Check browser DevTools Console (F12) for errors
3. Verify all environment variables are set correctly
4. Ensure Render deployment completed successfully

---

**Timeline:**
- Code fix: ✅ Completed and pushed to GitHub
- API key regeneration: ⏳ YOU MUST DO THIS NOW
- Restrictions: ⏳ YOU MUST DO THIS NOW
- Update environments: ⏳ After regeneration
- Testing: ⏳ After environment updates
