# Production Deployment Guide 🚀

## Backend is Live! ✅
- **Backend URL:** https://api.smartunivid.xyz
- **Frontend URL:** https://smartunivid.xyz (after deployment)

## Quick Deployment Steps

### 1. Update Environment Variables on Vercel

Go to your Vercel project settings and add:

```
NEXT_PUBLIC_API_URL=https://api.smartunivid.xyz
```

**Steps:**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add new variable:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://api.smartunivid.xyz`
   - **Environment:** Production, Preview, Development (select all)
5. Click "Save"

### 2. Redeploy Frontend

**Option A: Automatic (Recommended)**
```bash
git add .
git commit -m "Configure production API URL"
git push origin main
```
Vercel will automatically deploy when you push to main.

**Option B: Manual**
1. Go to Vercel dashboard
2. Select your project
3. Click "Deployments"
4. Click "Redeploy" on the latest deployment

### 3. Verify Deployment

After deployment completes:

1. Visit https://smartunivid.xyz
2. Try logging in
3. Check browser console for any errors
4. Verify API calls go to https://api.smartunivid.xyz

## Files Already Configured ✅

### Environment Files
- `.env.local` - Local development (localhost:8000)
- `.env.production` - Production (api.smartunivid.xyz)

### Configuration
- `lib/config.ts` - Centralized API configuration
- `lib/qrService.ts` - Already uses config

### Files That Need Updating
The following files still have hardcoded localhost URLs and need to be updated:

1. `app/dashboard/page.tsx`
2. `app/admin-dashboard-new.tsx`
3. `app/admin-dashboard-clean.tsx`
4. `app/test-dashboard/page.tsx`
5. `app/lecturer-dashboard/page.tsx`
6. `app/admin-dashboard/page.tsx`
7. `app/login/page.tsx`
8. `app/signup/page.tsx`
9. `app/forgot-password/page.tsx`
10. `app/reset-password/page.tsx`
11. `app/register-institution/page.tsx`
12. `app/verify-otp/page.tsx`

## Update Pattern

Replace all instances of:
```typescript
fetch('http://localhost:8000/api/...')
```

With:
```typescript
import { API_BASE_URL } from '@/lib/config';

fetch(`${API_BASE_URL}/api/...`)
```

## Testing Checklist

### Local Testing (Before Deployment)
- [ ] Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `.env.local`
- [ ] Run `npm run dev`
- [ ] Test login
- [ ] Test dashboard loading
- [ ] Test QR code generation
- [ ] Test QR scanning

### Production Testing (After Deployment)
- [ ] Visit https://smartunivid.xyz
- [ ] Test login with real account
- [ ] Verify dashboard loads
- [ ] Check QR code generation
- [ ] Test QR scanning
- [ ] Check attendance history
- [ ] Test all user roles (student, lecturer, admin)

## Troubleshooting

### Issue: API calls failing
**Solution:** Check browser console. If you see CORS errors, verify backend CORS settings allow `https://smartunivid.xyz`

### Issue: Environment variable not working
**Solution:** 
1. Verify variable name is exactly `NEXT_PUBLIC_API_URL`
2. Redeploy after adding variable
3. Check Vercel deployment logs

### Issue: Still using localhost
**Solution:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check if files were updated correctly

## CORS Configuration

Your backend needs to allow requests from:
- `https://smartunivid.xyz`
- `https://*.vercel.app` (for preview deployments)

Example backend CORS config:
```python
# FastAPI example
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://smartunivid.xyz",
        "https://*.vercel.app",
        "http://localhost:3000"  # for local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Monitoring

After deployment, monitor:
- Vercel deployment logs
- Browser console for errors
- API response times
- User feedback

## Rollback Plan

If issues occur:
1. Go to Vercel dashboard
2. Find previous working deployment
3. Click "Promote to Production"

## Next Steps

1. Update all hardcoded URLs (see list above)
2. Test locally
3. Commit and push changes
4. Verify Vercel deployment
5. Test production site
6. Monitor for issues

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Env Vars:** https://nextjs.org/docs/basic-features/environment-variables
- **Your Backend:** https://api.smartunivid.xyz

---

**Status:** Ready for deployment after updating hardcoded URLs  
**Last Updated:** February 19, 2026
