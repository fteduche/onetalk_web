# Onetalk Web - Security Implementation

This file documents the security measures implemented to make the website bulletproof.

## Security Enhancements Implemented

### 1. Environment Variables
- **Firebase credentials** moved to `.env` file (not committed to git)
- **Admin credentials** stored in environment variables
- All sensitive data now configurable via `VITE_*` environment variables
- Falls back to defaults only in development

### 2. Input Sanitization
- `sanitizeInput()` function removes XSS vectors (`<>'"`)
- Maximum input length enforced (500 characters)
- Trimming whitespace from all inputs
- Email normalization (lowercase)

### 3. Validation Improvements
- **Name validation**: 2-100 characters, letters/spaces/hyphens only
- **Strong password requirements**: 
  - Minimum 8 characters
  - Must include uppercase, lowercase, and numbers
- **Email validation**: RFC-compliant regex pattern

### 4. Rate Limiting
- Registration attempts limited to 5 per 5 minutes
- Prevents brute force attacks
- Automatic reset after cooldown period

### 5. Security Headers (Vite Config)
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - Browser XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Permissions-Policy` - Disables unnecessary features (geolocation, camera, microphone)

### 6. Build Security
- Console logs removed in production builds
- Source maps disabled in production
- Code minification with Terser
- Tree-shaking to remove unused code

### 7. Firebase Security
- User data sanitized before storage
- Firestore timestamps for audit trails
- ISO timestamps for additional tracking
- Graceful error handling for permission issues

### 8. Admin Authentication
- Static admin credentials (changeable via env vars)
- Pre-authentication credential check
- Prevents unauthorized Firebase Auth attempts
- Session management with Firebase Auth state

## Setup Instructions

1. **Create `.env` file** in project root (already created)
2. **Add to `.gitignore`**:
   ```
   .env
   .env.local
   ```

## Production Deployment - Environment Variables Setup

You need to configure the following environment variables on your hosting platform:

### Required Environment Variables

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyCpUOnfvYGWD-kP_MgUU5VcjGD5ZwhPUr8` | Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `onetalk-c7121.firebaseapp.com` | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | `onetalk-c7121` | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `onetalk-c7121.firebasestorage.app` | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `996418805484` | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | `1:996418805484:web:7fe1de306e67979b794fc9` | Firebase App ID |
| `VITE_ADMIN_EMAIL` | `fteduche@gmail.com` | Admin login email |
| `VITE_ADMIN_PASSWORD` | `fredrick001` | Admin login password |

---

### Option 1: Deploy on Render

**Step-by-Step Process:**

1. **Sign up/Login to Render**
   - Go to https://render.com
   - Create an account or sign in

2. **Create New Static Site**
   - Click "New +" button in dashboard
   - Select "Static Site"

3. **Connect Your Repository**
   - Connect your GitHub account
   - Select repository: `fteduche/onetalk_web`
   - Click "Connect"

4. **Configure Build Settings**
   - **Name**: `onetalk-web` (or your preferred name)
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

5. **Add Environment Variables**
   - Scroll down to "Environment Variables" section
   - Click "Add Environment Variable" button
   - Add each variable one by one:
     - Key: `VITE_FIREBASE_API_KEY` | Value: `AIzaSyCpUOnfvYGWD-kP_MgUU5VcjGD5ZwhPUr8`
     - Key: `VITE_FIREBASE_AUTH_DOMAIN` | Value: `onetalk-c7121.firebaseapp.com`
     - Key: `VITE_FIREBASE_PROJECT_ID` | Value: `onetalk-c7121`
     - Key: `VITE_FIREBASE_STORAGE_BUCKET` | Value: `onetalk-c7121.firebasestorage.app`
     - Key: `VITE_FIREBASE_MESSAGING_SENDER_ID` | Value: `996418805484`
     - Key: `VITE_FIREBASE_APP_ID` | Value: `1:996418805484:web:7fe1de306e67979b794fc9`
     - Key: `VITE_ADMIN_EMAIL` | Value: `fteduche@gmail.com`
     - Key: `VITE_ADMIN_PASSWORD` | Value: `fredrick001`

6. **Deploy**
   - Click "Create Static Site"
   - Render will automatically build and deploy your site
   - You'll get a default URL like: `https://onetalk-web.onrender.com`

7. **Configure Custom Domain** (if not already done)
   - Go to your site's dashboard
   - Click "Settings" in the left sidebar
   - Scroll to "Custom Domain" section
   - Click "Add Custom Domain"
   - Enter your domain: `onetalk.co`
   - Add these DNS records at your domain registrar:
     - **A Record**: `@` → `216.24.57.1`
     - **CNAME Record**: `www` → `onetalk-web.onrender.com`
   - SSL certificate will be automatically issued
   - Your site will be available at: `https://onetalk.co`

8. **Update Environment Variables Later** (if needed)
   - Go to your site's dashboard
   - Click "Environment" in the left sidebar
   - Add/Edit/Delete variables
   - Click "Save Changes"
   - Site will automatically redeploy

---

### Option 2: Deploy on Vercel

**Step-by-Step Process:**

1. **Sign up/Login to Vercel**
   - Go to https://vercel.com
   - Create an account or sign in

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import Git Repository
   - Connect your GitHub account
   - Select repository: `fteduche/onetalk_web`

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variables**
   - Expand "Environment Variables" section
   - Add each variable:
     - Name: `VITE_FIREBASE_API_KEY` | Value: `AIzaSyCpUOnfvYGWD-kP_MgUU5VcjGD5ZwhPUr8`
     - Name: `VITE_FIREBASE_AUTH_DOMAIN` | Value: `onetalk-c7121.firebaseapp.com`
     - Name: `VITE_FIREBASE_PROJECT_ID` | Value: `onetalk-c7121`
     - Name: `VITE_FIREBASE_STORAGE_BUCKET` | Value: `onetalk-c7121.firebasestorage.app`
     - Name: `VITE_FIREBASE_MESSAGING_SENDER_ID` | Value: `996418805484`
     - Name: `VITE_FIREBASE_APP_ID` | Value: `1:996418805484:web:7fe1de306e67979b794fc9`
     - Name: `VITE_ADMIN_EMAIL` | Value: `fteduche@gmail.com`
     - Name: `VITE_ADMIN_PASSWORD` | Value: `fredrick001`
   - Select environment: **Production** (check the box)

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your site
   - You'll get a URL like: `https://onetalk-web.vercel.app`

6. **Update Environment Variables Later** (if needed)
   - Go to your project dashboard
   - Click "Settings" tab
   - Click "Environment Variables" in the left sidebar
   - Add/Edit/Delete variables
   - Redeploy from "Deployments" tab

---

### Option 3: Deploy on Netlify

**Step-by-Step Process:**

1. **Sign up/Login to Netlify**
   - Go to https://netlify.com
   - Create an account or sign in

2. **Add New Site**
   - Click "Add new site" → "Import an existing project"
   - Click "Deploy with GitHub"
   - Authorize Netlify to access GitHub
   - Select repository: `fteduche/onetalk_web`

3. **Configure Build Settings**
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

4. **Add Environment Variables**
   - Click "Show advanced" button
   - Click "New variable" button repeatedly to add each:
     - Key: `VITE_FIREBASE_API_KEY` | Value: `AIzaSyCpUOnfvYGWD-kP_MgUU5VcjGD5ZwhPUr8`
     - Key: `VITE_FIREBASE_AUTH_DOMAIN` | Value: `onetalk-c7121.firebaseapp.com`
     - Key: `VITE_FIREBASE_PROJECT_ID` | Value: `onetalk-c7121`
     - Key: `VITE_FIREBASE_STORAGE_BUCKET` | Value: `onetalk-c7121.firebasestorage.app`
     - Key: `VITE_FIREBASE_MESSAGING_SENDER_ID` | Value: `996418805484`
     - Key: `VITE_FIREBASE_APP_ID` | Value: `1:996418805484:web:7fe1de306e67979b794fc9`
     - Key: `VITE_ADMIN_EMAIL` | Value: `fteduche@gmail.com`
     - Key: `VITE_ADMIN_PASSWORD` | Value: `fredrick001`

5. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy your site
   - You'll get a URL like: `https://onetalk-web.netlify.app`

6. **Update Environment Variables Later** (if needed)
   - Go to "Site settings"
   - Click "Environment variables" in the left sidebar
   - Click "Add a variable" or edit existing ones
   - Go to "Deploys" and click "Trigger deploy" → "Clear cache and deploy site"

---

## Quick Copy-Paste Template

For easy setup, copy this formatted list:

```
VITE_FIREBASE_API_KEY=AIzaSyCpUOnfvYGWD-kP_MgUU5VcjGD5ZwhPUr8
VITE_FIREBASE_AUTH_DOMAIN=onetalk-c7121.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=onetalk-c7121
VITE_FIREBASE_STORAGE_BUCKET=onetalk-c7121.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=996418805484
VITE_FIREBASE_APP_ID=1:996418805484:web:7fe1de306e67979b794fc9
VITE_ADMIN_EMAIL=fteduche@gmail.com
VITE_ADMIN_PASSWORD=fredrick001
```

---

## Verification After Deployment

1. Visit your deployed URL: `https://onetalk.co`
2. Open browser DevTools (F12)
3. Go to Console tab
4. Check for Firebase initialization (should show no errors)
5. Test registration: Try creating an account
6. Test admin login: Go to `https://onetalk.co/admin` and login with admin credentials
7. Verify admin dashboard loads correctly
8. Test on both `onetalk.co` and `www.onetalk.co` (should redirect properly)

---

## Additional Recommendations

### Firestore Security Rules
Update your Firebase Console with these rules:

**How to Update:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `onetalk-c7121`
3. Click "Firestore Database" in the left menu
4. Click the "Rules" tab
5. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Waitlist collection - authenticated users can create
    match /waitlist/{document} {
      allow create: if request.auth != null 
                    && request.resource.data.email == request.auth.token.email
                    && request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null 
                   && request.auth.token.email == 'fteduche@gmail.com';
    }
  }
}
```

6. Click "Publish"

### Firebase Authentication Settings

**How to Configure:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `onetalk-c7121`
3. Click "Authentication" in the left menu
4. Click "Settings" tab
5. Configure the following:

**Email Enumeration Protection:**
- Click "Settings" → "User actions"
- Enable "Email enumeration protection"

**Password Policy:**
- Already enforced in your code (8+ chars with uppercase, lowercase, numbers)
- Firebase minimum is 6 characters by default

**Authorized Domains:**
- Go to "Settings" → "Authorized domains"
- Ensure these domains are listed:
  - `localhost` (for development)
  - `onetalk.co`
  - `www.onetalk.co`
  - Your Render URL: `onetalk-web.onrender.com`

**Multi-Factor Authentication (Recommended for Admin):**
- Click on your admin account
- Enable 2FA for extra security

**Monitor Logs:**
- Click "Usage" tab to see authentication activity
- Set up Firebase Cloud Messaging for alerts

### Hosting Security
When deploying:
1. Enable HTTPS/SSL (automatic on most platforms)
2. Configure CSP (Content Security Policy) headers
3. Enable DDoS protection
4. Set up monitoring and alerts
5. Regular security audits

## Testing Checklist

- [ ] Test registration with weak passwords (should fail)
- [ ] Test registration with invalid emails (should fail)
- [ ] Test XSS attempts in form fields (should be sanitized)
- [ ] Test rate limiting (5+ rapid registration attempts)
- [ ] Test admin login with wrong credentials
- [ ] Test admin login with correct credentials
- [ ] Verify console logs removed in production build
- [ ] Verify security headers present (check browser DevTools)
- [ ] Test Firebase permissions (non-admin read attempt)

## Monitoring

Regular monitoring recommended:
- Firebase Authentication logs
- Firestore usage metrics
- Error tracking (consider Sentry integration)
- Performance monitoring
