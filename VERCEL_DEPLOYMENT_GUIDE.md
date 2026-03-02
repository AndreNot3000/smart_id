# Vercel Deployment Guide

## Environment Variables Setup

To deploy this application on Vercel, you need to configure the backend API URL as an environment variable.

### Step 1: Add Environment Variable in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:

```
Name: NEXT_PUBLIC_API_URL
Value: https://your-backend-api-url.com
```

**Important:** Replace `https://your-backend-api-url.com` with your actual backend API URL.

### Step 2: Redeploy

After adding the environment variable:
1. Go to **Deployments** tab
2. Click on the three dots (...) next to the latest deployment
3. Select **Redeploy**
4. Check "Use existing Build Cache" (optional)
5. Click **Redeploy**

## Local Development

For local development, create a `.env.local` file in the root directory:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Note:** This file is already in `.gitignore` and won't be committed to the repository.

## Environment Variable Usage

The application uses the environment variable in `lib/config.ts`:

```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

- **Production (Vercel):** Uses `NEXT_PUBLIC_API_URL` from Vercel environment variables
- **Local Development:** Uses `NEXT_PUBLIC_API_URL` from `.env.local` or defaults to `http://localhost:8000`

## Verification

After deployment, verify the API connection:

1. Open your Vercel deployment URL
2. Try to login
3. Check browser console for any API errors
4. If you see CORS errors, configure your backend to allow requests from your Vercel domain

## Common Issues

### Issue 1: Login Not Working
**Cause:** `NEXT_PUBLIC_API_URL` not set in Vercel
**Solution:** Add the environment variable and redeploy

### Issue 2: CORS Errors
**Cause:** Backend not configured to accept requests from Vercel domain
**Solution:** Add your Vercel domain to backend CORS allowed origins

### Issue 3: 404 on API Calls
**Cause:** Incorrect API URL format
**Solution:** Ensure URL doesn't have trailing slash: `https://api.example.com` (not `https://api.example.com/`)

## Backend Requirements

Your backend API must:
1. Be publicly accessible (not localhost)
2. Support HTTPS
3. Have CORS configured to allow your Vercel domain
4. Accept requests with `Authorization: Bearer <token>` header

## Testing

To test the deployment:

1. **Login Test:**
   - Go to `/login`
   - Enter credentials
   - Should successfully login and redirect

2. **Dashboard Test:**
   - After login, check if dashboard loads
   - Verify profile data displays
   - Check if QR code generates

3. **API Connection Test:**
   - Open browser DevTools → Network tab
   - Perform an action (login, load dashboard)
   - Check if API calls go to correct URL
   - Verify responses are successful (200 status)

## Deployment Checklist

- [ ] Backend API is deployed and accessible
- [ ] Backend CORS is configured
- [ ] `NEXT_PUBLIC_API_URL` added in Vercel
- [ ] Application redeployed after adding env variable
- [ ] Login tested and working
- [ ] Dashboard loads correctly
- [ ] QR code system works
- [ ] All API calls use correct URL

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify environment variable is set correctly
4. Test backend API directly (using Postman/curl)
5. Check backend logs for incoming requests

---

**Last Updated:** March 2, 2026
