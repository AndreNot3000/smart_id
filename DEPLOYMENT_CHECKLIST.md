# Deployment Checklist ✅

## Pre-Deployment

- [x] Backend deployed at https://api.smartunivid.xyz
- [x] All API endpoints using environment variable
- [x] Environment files configured (.env.example, .env.local)
- [x] Git ignoring .env.local
- [x] No TypeScript errors
- [x] No hardcoded localhost URLs in main files

## Vercel Configuration

### Step 1: Set Environment Variable
- [ ] Go to Vercel Dashboard
- [ ] Select your project
- [ ] Navigate to Settings → Environment Variables
- [ ] Add: `NEXT_PUBLIC_API_URL` = `https://api.smartunivid.xyz`
- [ ] Apply to: Production, Preview, Development
- [ ] Save changes

### Step 2: Deploy
- [ ] Push latest changes to GitHub
- [ ] Verify Vercel auto-deploys
- [ ] OR manually trigger deployment from Vercel dashboard

### Step 3: Verify
- [ ] Visit https://smartunivid.xyz
- [ ] Open DevTools → Network tab
- [ ] Verify API calls go to https://api.smartunivid.xyz
- [ ] No localhost URLs in network requests

## Post-Deployment Testing

### Authentication Flow
- [ ] Register new institution
- [ ] Admin login works
- [ ] Create student account
- [ ] Student receives OTP email
- [ ] OTP verification works
- [ ] Student login works
- [ ] Create lecturer account
- [ ] Lecturer login works
- [ ] Forgot password flow
- [ ] Reset password works

### Student Dashboard
- [ ] Dashboard loads
- [ ] Profile displays correctly
- [ ] QR code generates
- [ ] Avatar overlay shows in QR
- [ ] Timer shows 24h expiration
- [ ] Attendance history loads
- [ ] Pagination works

### Lecturer Dashboard
- [ ] Dashboard loads
- [ ] Profile displays correctly
- [ ] QR scanner starts
- [ ] Camera permissions work
- [ ] Can scan student QR
- [ ] Student info displays
- [ ] Mark attendance works
- [ ] Student history search works

### Admin Dashboard
- [ ] Dashboard loads
- [ ] Stats display correctly
- [ ] Student list loads
- [ ] Create student works
- [ ] Lecturer list loads
- [ ] Create lecturer works
- [ ] QR scanner works
- [ ] Student history works

### Mobile Testing
- [ ] Responsive design works
- [ ] Touch interactions work
- [ ] Camera works on mobile
- [ ] QR scanning works
- [ ] Forms are usable
- [ ] Navigation works

### Performance
- [ ] Page load < 3 seconds
- [ ] API responses < 2 seconds
- [ ] No console errors
- [ ] No 404 errors
- [ ] Images load properly

### Security
- [ ] HTTPS enabled
- [ ] No API keys in frontend code
- [ ] CORS configured on backend
- [ ] JWT tokens working
- [ ] Session management works
- [ ] Logout works properly

## Rollback Plan

If issues occur:
- [ ] Note the issue
- [ ] Check Vercel logs
- [ ] Revert to previous deployment if needed
- [ ] Update environment variable if needed
- [ ] Document the issue

## Success Criteria

Deployment is successful when ALL of these are true:
- ✅ Frontend accessible at https://smartunivid.xyz
- ✅ All API calls use https://api.smartunivid.xyz
- ✅ Authentication works end-to-end
- ✅ All dashboards functional
- ✅ QR system works
- ✅ Mobile responsive
- ✅ No critical errors

## Commands Reference

```bash
# Push to GitHub (triggers Vercel deployment)
git add .
git commit -m "Production deployment"
git push origin main

# Check Vercel deployments
vercel ls

# View deployment logs
vercel logs

# Pull environment variables
vercel env pull
```

## Support Resources

- **Deployment Guide:** `PRODUCTION_DEPLOYMENT.md`
- **QR System:** `QR_SYSTEM_README.md`
- **Testing:** `QR_TESTING_GUIDE.md`
- **Auth Flow:** `AUTH_FLOW.md`

---

**Backend:** https://api.smartunivid.xyz  
**Frontend:** https://smartunivid.xyz  
**Status:** Ready to Deploy 🚀
