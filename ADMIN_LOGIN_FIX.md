# Admin Login Fix - Quick Guide

## The Issue
You're getting `auth/invalid-credential` error because **the admin Firebase account doesn't exist yet**.

## Solution: Create the Admin Account First

### Step 1: Go to the home page
Open your browser to: `http://localhost:3002` (check your terminal for the exact port)

### Step 2: Register as Admin
1. Click "Join Waitlist" button
2. Fill in the registration form with **EXACTLY** these details:
   - **Full Name:** Frederick Teduche (or any name you prefer)
   - **Email:** `fteduche@gmail.com`
   - **Password:** `Fredrick001` (capital F, meets strong password requirements)
3. Click "Create Account"
4. You should see the "Thank You" page - this means the account was created successfully

### Step 3: Login to Admin Dashboard
1. Navigate to: `http://localhost:3002/admin`
2. Enter the credentials:
   - **Email:** `fteduche@gmail.com`
   - **Password:** `Fredrick001`
3. Click the eye icon to show/hide your password
4. Click "Login"
5. ✅ You should now see the Admin Dashboard with waitlist entries!

---

## Password Visibility Toggle Added ✅

Both the registration form and admin login now have an eye icon:
- 👁️ Click the eye icon to show the password
- 👁️‍🗨️ Click again to hide it

---

## For Production (onetalk.co)

After testing locally works, you need to:

1. **Update Render environment variable:**
   - Go to: https://dashboard.render.com/
   - Select: `onetalk-web`
   - Click "Environment" tab
   - Find `VITE_ADMIN_PASSWORD`
   - Change value to: `Fredrick001`
   - Click "Save Changes"
   - Wait for auto-redeploy (~2-3 minutes)

2. **Register on production:**
   - Go to: https://onetalk.co
   - Click "Join Waitlist"
   - Register with email `fteduche@gmail.com` and password `Fredrick001`

3. **Login to production admin:**
   - Go to: https://onetalk.co/admin
   - Use the same credentials
   - You'll see your production waitlist entries!

---

## About the CSS Warning (can be ignored)

The warning `Refused to apply style from 'http://localhost:3002/index.css'` is harmless. The styles are embedded in the JS file, so everything works fine. This is normal for Vite in development mode.

---

## Quick Test Checklist

- [ ] Registered account with `fteduche@gmail.com` and `Fredrick001`
- [ ] Saw "Thank You" page after registration
- [ ] Navigated to `/admin` page
- [ ] Entered credentials and clicked eye icon to verify password
- [ ] Successfully logged in to admin dashboard
- [ ] Can see waitlist entries (at least your own)

---

**Need Help?**
If you still can't login after registration, check:
1. Browser console for specific error messages
2. Make sure you used the exact email and password above
3. Try clearing browser cache and cookies
4. Restart the dev server: `Ctrl+C` then `npm run dev`
