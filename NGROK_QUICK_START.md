# Ngrok Quick Start - Mobile Testing

## 🚀 Quick Setup (3 Steps)

### Step 1: Update Backend URL
Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://[backend-ngrok-url].ngrok-free.app
```

### Step 2: Restart Dev Server
```bash
npm run dev
```

### Step 3: Start Your Ngrok
```bash
ngrok http 3000
```

---

## 📱 Share With Backend Team

Your frontend ngrok URL:
```
https://[your-url].ngrok-free.dev
```

Callback URL for payments:
```
https://[your-url].ngrok-free.dev/payment/callback
```

---

## ✅ Test on Mobile

1. Open your ngrok URL on phone
2. Login to app
3. Test features
4. Test payments

---

## 🔄 When Ngrok URLs Change

### Backend URL Changed:
1. Update `.env.local`
2. Restart: `npm run dev`

### Your URL Changed:
1. Tell backend team new callback URL

---

## 📋 Current URLs

**Backend Ngrok:**
```
[Backend team provides]
```

**Frontend Ngrok:**
```
[You provide after starting ngrok]
```

**Callback URL:**
```
[Your ngrok]/payment/callback
```

---

## 🆘 Troubleshooting

**API calls failing?**
- Check backend URL in `.env.local`
- Restart dev server

**Payment callback 404?**
- Make sure ngrok is running
- Tell backend your callback URL

**Ngrok not working?**
```bash
# Make sure both running:
npm run dev          # Terminal 1
ngrok http 3000      # Terminal 2
```

---

## 📚 Full Documentation

See `FRONTEND_NGROK_SETUP.md` for complete guide.
