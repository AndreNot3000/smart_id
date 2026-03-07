# Ngrok Testing Checklist ✅

## Pre-Testing Setup

- [ ] Ngrok installed from Microsoft Store
- [ ] Node.js and npm installed
- [ ] `.env.local` file created with production backend URL
- [ ] Dependencies installed (`npm install`)

## Starting Services

### Terminal 1: Next.js
- [ ] Open PowerShell/Command Prompt
- [ ] Navigate to project folder
- [ ] Run `npm run dev`
- [ ] Wait for "Ready" message
- [ ] Verify `http://localhost:3000` works

### Terminal 2: Ngrok
- [ ] Open another PowerShell/Command Prompt
- [ ] Run `ngrok http 3000`
- [ ] Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)
- [ ] Keep terminal open

## Mobile Testing

### Initial Access
- [ ] Open mobile browser (Chrome/Safari)
- [ ] Enter Ngrok HTTPS URL
- [ ] Click "Visit Site" if prompted
- [ ] App loads successfully

### Authentication Testing
- [ ] Login page displays correctly
- [ ] Can enter email and password
- [ ] Password visibility toggle works
- [ ] Submit button works
- [ ] Login succeeds
- [ ] Redirects to correct dashboard

### Student Dashboard Testing
- [ ] Profile data loads
- [ ] Stats display correctly
- [ ] Navigation menu works
- [ ] "My QR Code" section accessible
- [ ] QR code generates
- [ ] Avatar displays in QR center
- [ ] Timer shows 24-hour countdown
- [ ] "Regenerate" button works
- [ ] "My Attendance" section accessible
- [ ] Attendance history loads
- [ ] Pagination works (if applicable)

### Lecturer Dashboard Testing
- [ ] Profile data loads
- [ ] Dashboard stats display
- [ ] "QR Scanner" section accessible
- [ ] "Start Scanner" button works
- [ ] Camera permission prompt appears
- [ ] Camera starts successfully
- [ ] Can scan QR code
- [ ] Student info displays after scan
- [ ] Purpose field works
- [ ] Location field works
- [ ] "Mark Attendance" button works
- [ ] Success message displays
- [ ] Can scan another student

### Admin Dashboard Testing
- [ ] Profile data loads
- [ ] Dashboard stats display
- [ ] Student list loads
- [ ] Lecturer list loads
- [ ] "QR Scanner" works (same as lecturer)
- [ ] "Student History" search works
- [ ] Can view specific student's attendance

### Responsive Design Testing
- [ ] Layout looks good in portrait mode
- [ ] Layout looks good in landscape mode
- [ ] Text is readable (not too small)
- [ ] Buttons are tappable (not too small)
- [ ] Forms work with mobile keyboard
- [ ] Keyboard doesn't break layout
- [ ] Scrolling works smoothly
- [ ] Images load correctly
- [ ] Icons display properly

### Mobile-Specific Features
- [ ] Touch interactions work
- [ ] Swipe gestures work (if any)
- [ ] Camera access works (QR scanner)
- [ ] Vibration feedback works (QR scanner)
- [ ] Back button works correctly
- [ ] Links open correctly
- [ ] No horizontal scrolling issues

### Performance Testing
- [ ] Pages load quickly
- [ ] No lag when navigating
- [ ] API calls complete in reasonable time
- [ ] Images load without delay
- [ ] Animations are smooth
- [ ] No freezing or crashes

### Error Handling Testing
- [ ] Invalid login shows error message
- [ ] Network errors display properly
- [ ] Expired QR codes are rejected
- [ ] Camera permission denial handled
- [ ] API errors show user-friendly messages
- [ ] Loading states display correctly

## Debugging

### If Issues Occur
- [ ] Check browser console (F12 on desktop)
- [ ] Check Ngrok dashboard (`http://localhost:4040`)
- [ ] Verify backend is accessible
- [ ] Check `.env.local` configuration
- [ ] Restart Next.js if needed
- [ ] Restart Ngrok if needed
- [ ] Clear browser cache
- [ ] Try different browser

### Common Issues Checked
- [ ] "Visit Site" button clicked (Ngrok free plan)
- [ ] Using HTTPS URL (not HTTP)
- [ ] Camera permissions granted
- [ ] Backend URL correct in `.env.local`
- [ ] Next.js restarted after env changes
- [ ] Mobile has internet connection
- [ ] Ngrok tunnel is active

## Post-Testing

### Documentation
- [ ] Note any bugs found
- [ ] Document device/browser tested
- [ ] Screenshot any issues
- [ ] List features that work well
- [ ] List features that need improvement

### Cleanup
- [ ] Stop Next.js (Ctrl+C in Terminal 1)
- [ ] Stop Ngrok (Ctrl+C in Terminal 2)
- [ ] Close Ngrok dashboard
- [ ] Save any test notes

## Test Results Summary

### Devices Tested
- [ ] Device 1: _________________ (OS: _______, Browser: _______)
- [ ] Device 2: _________________ (OS: _______, Browser: _______)
- [ ] Device 3: _________________ (OS: _______, Browser: _______)

### Features Working
- [ ] Authentication: ✅ / ❌
- [ ] Student Dashboard: ✅ / ❌
- [ ] QR Code Generation: ✅ / ❌
- [ ] QR Code Scanning: ✅ / ❌
- [ ] Attendance History: ✅ / ❌
- [ ] Responsive Design: ✅ / ❌
- [ ] Camera Access: ✅ / ❌

### Issues Found
1. _________________________________________________________________
2. _________________________________________________________________
3. _________________________________________________________________

### Next Steps
- [ ] Fix critical bugs
- [ ] Improve mobile UX
- [ ] Optimize performance
- [ ] Deploy to production
- [ ] Test production deployment

---

**Testing Date:** _______________  
**Tester:** _______________  
**Ngrok URL Used:** _______________  
**Backend URL:** https://api.smartunivid.xyz
