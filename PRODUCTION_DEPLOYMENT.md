# Production Deployment Guide 🚀

## Backend is Live! ✅
- **Backend URL:** https://api.smartunivid.xyz
- **Frontend URL:** https://smartunivid.xyz

## Quick Deployment Steps

### 1. Update Environment Variable in Vercel

Go to your Vercel project settings and add/update the environment variable:

```
NEXT_PUBLIC_API_URL=https://api.smartunivid.xyz
```

**Steps:**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add or update `NEXT_PUBLIC_API_URL` with value: `https://api.smartunivid.xyz`
5. Select all environments (Production, Preview, Development)
6. Click **Save**

### 2. Redeploy Frontend

After updating the environment variable, trigger a new deployment:

**Option A: Via Vercel Dashboard**
1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Click **Redeploy**
4. Select **Use existing Build Cache** (optional, faster)
5. Click **Redeploy**

**Option B: Via Git Push**
```bash
git add .
git commit -m "Update API URL for production"
git push origin main
```

Vercel will automatically deploy when you push to main branch.

### 3. Verify Deployment

Once deployed, test your application:

1. **Visit:** https://smartunivid.xyz
2. **Test Login:** Try logging in with test credentials
3. **Check API Calls:** Open browser DevTools → Network tab
4. **Verify:** All API calls should go to `https://api.smartunivid.xyz`

## Environment Configuration

### Local Development (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Production (Vercel Environment Variables)
```env
NEXT_PUBLIC_API_URL=https://api.smartunivid.xyz
```

## Files Already Configured ✅

The following files are already set up to use the environment variable:

### Core Configuration
- ✅ `lib/config.ts` - Central API configuration
- ✅ `lib/qrService.ts` - QR code API service

### Dashboard Pages
- ✅ `app/test-dashboard/page.tsx` - Student dashboard
- ✅ `app/lecturer-dashboard/page.tsx` - Lecturer dashboard
- ✅ `app/admin-dashboard/page.tsx` - Admin dashboard

### Authentication Pages
- ✅ `app/login/page.tsx` - Login page
- ✅ `app/signup/page.tsx` - Signup page
- ✅ `app/forgot-password/page.tsx` - Forgot password
- ✅ `app/reset-password/page.tsx` - Reset password
- ✅ `app/verify-otp/page.tsx` - OTP verification
- ✅ `app/register-institution/page.tsx` - Institution registration

All these files use the `API_BASE_URL` from `lib/config.ts`, which automatically picks up the environment variable.

## How It Works

### Configuration File (`lib/config.ts`)
```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};
```

### Usage in Components
```typescript
import { API_BASE_URL, getApiUrl } from '@/lib/config';

// Option 1: Direct URL
const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Option 2: Using helper function
const response = await fetch(getApiUrl('/api/users/profile'), {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Testing Checklist

After deployment, test these features:

### Authentication
- [ ] Institution registration
- [ ] Admin login
- [ ] Student login
- [ ] Lecturer login
- [ ] Forgot password
- [ ] Reset password
- [ ] OTP verification

### Student Dashboard
- [ ] Profile loading
- [ ] QR code generation
- [ ] Attendance history
- [ ] Dashboard stats

### Lecturer Dashboard
- [ ] Profile loading
- [ ] QR scanner
- [ ] Mark attendance
- [ ] Student history search
- [ ] Course management

### Admin Dashboard
- [ ] Profile loading
- [ ] Dashboard stats
- [ ] Student management
- [ ] Lecturer management
- [ ] QR scanner
- [ ] Student history

## Troubleshooting

### Issue: API calls still going to localhost

**Solution:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check Vercel environment variables are set
4. Verify deployment used the new environment variable

### Issue: CORS errors

**Solution:**
Backend needs to allow your frontend domain:
```python
# Backend CORS configuration should include:
ALLOWED_ORIGINS = [
    "https://smartunivid.xyz",
    "https://*.vercel.app",  # For preview deployments
    "http://localhost:3000"   # For local development
]
```

### Issue: 404 errors on API calls

**Solution:**
1. Verify backend is running: https://api.smartunivid.xyz
2. Check API endpoint paths are correct
3. Verify backend routes are deployed

### Issue: Authentication not working

**Solution:**
1. Check sessionStorage is working (not blocked)
2. Verify JWT tokens are being sent in headers
3. Check backend JWT secret is configured
4. Verify token expiration times

## Monitoring

### Check Deployment Status
```bash
# View recent deployments
vercel ls

# View deployment logs
vercel logs [deployment-url]
```

### Check Environment Variables
```bash
# List all environment variables
vercel env ls

# Pull environment variables to local
vercel env pull
```

## Rollback Plan

If issues occur in production:

### Quick Rollback
1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click three dots (...) → **Promote to Production**

### Revert Environment Variable
1. Go to Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` back to previous value
3. Redeploy

## Performance Optimization

### Enable Caching
Vercel automatically caches static assets. Ensure your API responses include appropriate cache headers.

### Monitor Performance
- Use Vercel Analytics to track performance
- Monitor API response times
- Check for slow queries

## Security Checklist

- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Environment variables secured (not in code)
- [ ] CORS properly configured on backend
- [ ] JWT tokens stored in sessionStorage (not localStorage)
- [ ] API rate limiting enabled on backend
- [ ] Input validation on all forms

## Next Steps

1. **Set up monitoring:** Add error tracking (Sentry, LogRocket)
2. **Configure analytics:** Add Google Analytics or Vercel Analytics
3. **Set up alerts:** Configure Vercel notifications for deployment failures
4. **Document API:** Keep API documentation up to date
5. **User testing:** Conduct thorough testing with real users

## Support

### Vercel Documentation
- https://vercel.com/docs
- https://vercel.com/docs/environment-variables

### Project Documentation
- `QR_SYSTEM_README.md` - QR system documentation
- `QR_TESTING_GUIDE.md` - Testing guide
- `AUTH_FLOW.md` - Authentication flow

## Success Criteria

Deployment is successful when:
- ✅ Frontend accessible at https://smartunivid.xyz
- ✅ All API calls go to https://api.smartunivid.xyz
- ✅ Authentication works end-to-end
- ✅ QR system functions properly
- ✅ All dashboards load correctly
- ✅ No console errors
- ✅ Mobile responsive

---

**Last Updated:** February 19, 2026  
**Backend URL:** https://api.smartunivid.xyz  
**Frontend URL:** https://smartunivid.xyz  
**Status:** Ready for Production Deployment 🚀
