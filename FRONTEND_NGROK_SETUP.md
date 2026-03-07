# Frontend Ngrok Setup Guide

## Overview
This guide explains how to configure the frontend to work with the backend's Ngrok URL for mobile testing.

---

## Quick Setup

### 1. Update `.env.local` File

Open `.env.local` and update the API URL:

```env
# For Ngrok Testing (Backend provides this URL)
NEXT_PUBLIC_API_URL=https://[backend-ngrok-url].ngrok-free.app

# Example:
# NEXT_PUBLIC_API_URL=https://abc123.ngrok-free.app
```

### 2. Restart Dev Server

After updating `.env.local`, restart your dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 3. Start Your Own Ngrok (For Frontend)

In a new terminal:

```bash
ngrok http 3000
```

Copy the ngrok URL (e.g., `https://xyz789.ngrok-free.dev`)

### 4. Share Your Frontend Ngrok URL

Give this URL to:
- Backend team (for callback URL configuration)
- Testers (to access the app on mobile)

---

## Environment Variables Reference

### Development (Local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Development (Ngrok Backend)
```env
NEXT_PUBLIC_API_URL=https://[backend-ngrok-url].ngrok-free.app
```

### Production (Vercel)
```env
NEXT_PUBLIC_API_URL=https://api.smartunivid.xyz
```

---

## Complete Testing Setup

### Backend Team Provides:
- Backend Ngrok URL: `https://abc123.ngrok-free.app`
- This URL changes each time they restart ngrok

### Frontend Team Provides:
- Frontend Ngrok URL: `https://xyz789.ngrok-free.dev`
- This URL changes each time you restart ngrok

### Configuration Steps:

1. **Update Frontend `.env.local`:**
   ```env
   NEXT_PUBLIC_API_URL=https://abc123.ngrok-free.app
   ```

2. **Restart Frontend Dev Server:**
   ```bash
   npm run dev
   ```

3. **Start Frontend Ngrok:**
   ```bash
   ngrok http 3000
   ```

4. **Tell Backend Your Frontend Ngrok URL:**
   ```
   Frontend URL: https://xyz789.ngrok-free.dev
   Callback URL: https://xyz789.ngrok-free.dev/payment/callback
   ```

5. **Test on Mobile:**
   - Open `https://xyz789.ngrok-free.dev` on your phone
   - Login and test features
   - Payment callbacks will work correctly

---

## Payment Callback Configuration

### Important for Backend Team:

When initializing Paystack payments, use the frontend ngrok URL:

```javascript
// Backend code
const paystackData = {
  email: user.email,
  amount: amount * 100,
  reference: reference,
  callback_url: 'https://xyz789.ngrok-free.dev/payment/callback' // ← Frontend ngrok URL
};
```

### Testing Payment Flow:

1. Open frontend ngrok URL on mobile
2. Go to Payments → Top Up
3. Enter amount and pay
4. Paystack redirects to: `https://xyz789.ngrok-free.dev/payment/callback?reference=...`
5. Callback page verifies payment
6. Wallet is credited
7. User redirected to wallet page

---

## Troubleshooting

### Issue: API calls failing

**Check:**
1. Is backend ngrok URL correct in `.env.local`?
2. Did you restart dev server after changing `.env.local`?
3. Is backend ngrok still running?
4. Check browser console for actual API URL being called

**Fix:**
```bash
# Update .env.local with correct backend ngrok URL
# Then restart:
npm run dev
```

### Issue: Payment callback 404

**Check:**
1. Did you tell backend your frontend ngrok URL?
2. Is frontend ngrok still running?
3. Is dev server running?

**Fix:**
```bash
# Make sure both are running:
# Terminal 1:
npm run dev

# Terminal 2:
ngrok http 3000
```

### Issue: Ngrok URL changed

**When backend ngrok changes:**
1. Backend team provides new URL
2. Update `.env.local`
3. Restart dev server

**When frontend ngrok changes:**
1. Restart ngrok
2. Get new URL
3. Tell backend team new callback URL

---

## Current Configuration

### Backend Ngrok URL:
```
[Backend team will provide this]
```

### Frontend Ngrok URL:
```
[You provide this after starting ngrok]
```

### Callback URL:
```
[Your frontend ngrok URL]/payment/callback
```

---

## Production Deployment

### Vercel Environment Variables:

In Vercel dashboard, set:
```
NEXT_PUBLIC_API_URL=https://api.smartunivid.xyz
```

### Production Callback URL:
```
https://www.smartunivid.xyz/payment/callback
```

Backend should use production callback URL in production environment.

---

## Quick Reference Commands

### Start Dev Server:
```bash
npm run dev
```

### Start Ngrok:
```bash
ngrok http 3000
```

### Check Current API URL:
```bash
# In browser console:
console.log(process.env.NEXT_PUBLIC_API_URL)
```

### Update Environment Variable:
```bash
# 1. Edit .env.local
# 2. Restart dev server
npm run dev
```

---

## Testing Checklist

### Before Testing:
- [ ] Backend ngrok URL received
- [ ] Updated `.env.local` with backend ngrok URL
- [ ] Restarted dev server
- [ ] Started frontend ngrok
- [ ] Shared frontend ngrok URL with backend
- [ ] Backend configured callback URL

### During Testing:
- [ ] Can access app via frontend ngrok URL
- [ ] Can login
- [ ] API calls work (check network tab)
- [ ] Can view wallet balance
- [ ] Can initiate payment
- [ ] Paystack redirects to callback
- [ ] Payment verification works
- [ ] Wallet credited successfully

### After Testing:
- [ ] Document any issues
- [ ] Share test results
- [ ] Update production if needed

---

## Notes

- Ngrok URLs are temporary and change on restart
- Always coordinate with backend team when URLs change
- Use production URLs for production deployment
- Keep `.env.local` in `.gitignore` (already configured)
- Never commit ngrok URLs to git

---

## Support

If you encounter issues:
1. Check this guide
2. Verify all URLs are correct
3. Check browser console for errors
4. Check network tab for API calls
5. Coordinate with backend team
