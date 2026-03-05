# Vercel Environment Variable Setup

## Quick Setup (2 minutes)

### 1. Go to Vercel Dashboard
https://vercel.com/dashboard

### 2. Select Your Project
Click on your `smart_id` or `campus-id-frontend` project

### 3. Go to Settings
Click **Settings** in the top navigation

### 4. Click Environment Variables
In the left sidebar, click **Environment Variables**

### 5. Add New Variable
Click **Add New** button

### 6. Enter Variable Details

```
Key: NEXT_PUBLIC_API_URL
Value: https://api.smartunivid.xyz
```

**Important:** Check all three environment checkboxes:
- ✅ Production
- ✅ Preview
- ✅ Development

### 7. Save
Click **Save** button

### 8. Redeploy (if needed)
If your app already deployed:
1. Go to **Deployments** tab
2. Click latest deployment
3. Click **Redeploy** button

## That's It!

Your app will now use the production API URL.

## Verify It Worked

After deployment:
1. Visit https://smartunivid.xyz
2. Open DevTools (F12)
3. Go to Network tab
4. Try logging in
5. Check API calls go to `https://api.smartunivid.xyz` ✅

## Screenshot Guide

```
Vercel Dashboard
├── Select Project
├── Settings
│   └── Environment Variables
│       └── Add New
│           ├── Key: NEXT_PUBLIC_API_URL
│           ├── Value: https://api.smartunivid.xyz
│           └── Environments: [✓] Production [✓] Preview [✓] Development
│           └── [Save]
└── Deployments
    └── [Redeploy]
```

## Common Issues

### Issue: Variable not working
**Solution:** Make sure you checked all three environment checkboxes

### Issue: Still using localhost
**Solution:** Redeploy after adding the variable

### Issue: Can't find Environment Variables
**Solution:** Make sure you're in Settings, not Deployments

## Need Help?

- Vercel Docs: https://vercel.com/docs/concepts/projects/environment-variables
- Support: https://vercel.com/support

---

**Variable Name:** `NEXT_PUBLIC_API_URL`  
**Variable Value:** `https://api.smartunivid.xyz`  
**Environments:** All three (Production, Preview, Development)
