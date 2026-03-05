# 🚀 Deploy to Production NOW!

## ✅ All Files Updated!

All hardcoded `localhost:8000` URLs have been replaced with the centralized `API_BASE_URL` configuration.

## Files Updated ✅

1. ✅ `app/dashboard/page.tsx` - Uses API_BASE_URL
2. ✅ `app/admin-dashboard-clean.tsx` - Uses API_BASE_URL
3. ✅ `app/admin-dashboard-new.tsx` - Uses API_BASE_URL
4. ✅ `app/test-dashboard/page.tsx` - Already using config
5. ✅ `app/lecturer-dashboard/page.tsx` - Already using config
6. ✅ `app/admin-dashboard/page.tsx` - Already using config
7. ✅ `app/login/page.tsx` - Already using config
8. ✅ `app/signup/page.tsx` - Already using config
9. ✅ `app/forgot-password/page.tsx` - Already using config
10. ✅ `app/reset-password/page.tsx` - Already using config
11. ✅ `app/register-institution/page.tsx` - Error message updated
12. ✅ `app/verify-otp/page.tsx` - Error message updated
13. ✅ `lib/qrService.ts` - Already using config
14. ✅ `lib/config.ts` - Configuration file ready

## Environment Files Created ✅

1. ✅ `.env.local` - Local development (localhost:8000)
2. ✅ `.env.production` - Production (api.smartunivid.xyz)

## 3-Step Deployment Process

### Step 1: Configure Vercel Environment Variable

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://api.smartunivid.xyz`
   - **Environments:** Check all three (Production, Preview, Development)
5. Click **Save**

### Step 2: Push to GitHub

```bash
# Add all changes
git add .

# Commit with descriptive message
git commit -m "Configure production API URL and update all endpoints"

# Push to GitHub (triggers automatic Vercel deployment)
git push origin main
```

### Step 3: Verify Deployment

1. Wait for Vercel deployment to complete (usually 2-3 minutes)
2. Visit https://smartunivid.xyz
3. Open browser DevTools (F12) → Network tab
4. Try logging in
5. Verify API calls go to `https://api.smartunivid.xyz`

## Quick Test Checklist

After deployment, test these features:

### Authentication
- [ ] Login works
- [ ] Signup works
- [ ] Forgot password works
- [ ] Reset password works
- [ ] OTP verification works

### Student Dashboard
- [ ] Dashboard loads
- [ ] Profile displays correctly
- [ ] QR code generates
- [ ] QR code shows avatar overlay
- [ ] Attendance history loads
- [ ] Pagination works

### Lecturer Dashboard
- [ ] Dashboard loads
- [ ] Profile displays correctly
- [ ] QR scanner starts
- [ ] Can scan student QR codes
- [ ] Mark attendance works
- [ ] Student history loads

### Admin Dashboard
- [ ] Dashboard loads
- [ ] Stats display correctly
- [ ] Student list loads
- [ ] Lecturer list loads
- [ ] Can create students
- [ ] Can create lecturers
- [ ] QR scanner works

## Troubleshooting

### Issue: API calls still going to localhost
**Solution:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check Vercel environment variable is set
4. Verify deployment used latest code

### Issue: CORS errors
**Solution:** Ensure backend allows requests from:
- `https://smartunivid.xyz`
- `https://*.vercel.app`

### Issue: 404 errors on API calls
**Solution:**
1. Verify backend is running at https://api.smartunivid.xyz
2. Test API directly: `curl https://api.smartunivid.xyz/api/health`
3. Check API endpoint paths are correct

### Issue: Environment variable not working
**Solution:**
1. Verify variable name is exactly `NEXT_PUBLIC_API_URL`
2. Redeploy after adding variable
3. Check Vercel deployment logs for errors

## Monitoring

After deployment, monitor:

1. **Vercel Dashboard**
   - Deployment status
   - Build logs
   - Runtime logs

2. **Browser Console**
   - Check for JavaScript errors
   - Verify API calls
   - Check network requests

3. **User Feedback**
   - Test with real users
   - Collect feedback
   - Fix issues quickly

## Backend CORS Configuration

Ensure your backend has this CORS configuration:

```python
# FastAPI example
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://smartunivid.xyz",
        "https://*.vercel.app",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Rollback Plan

If something goes wrong:

1. Go to Vercel dashboard
2. Click "Deployments"
3. Find previous working deployment
4. Click "..." → "Promote to Production"

## Success Criteria

Deployment is successful when:

- ✅ Site loads at https://smartunivid.xyz
- ✅ Login works
- ✅ All dashboards load
- ✅ QR system works
- ✅ No console errors
- ✅ API calls go to production backend

## Next Steps After Deployment

1. Test all features thoroughly
2. Monitor for errors
3. Collect user feedback
4. Fix any issues
5. Celebrate! 🎉

---

## Ready to Deploy?

Run these commands now:

```bash
git add .
git commit -m "Configure production API URL and update all endpoints"
git push origin main
```

Then watch your Vercel dashboard for the deployment!

**Your app will be live at:** https://smartunivid.xyz

---

**Backend:** https://api.smartunivid.xyz ✅  
**Frontend:** https://smartunivid.xyz (deploying...)  
**Status:** Ready to deploy! 🚀
