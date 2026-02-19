# QR Code System Testing Guide

## Overview
This guide helps you test the complete QR code-based student ID and attendance system after the backend changes (24-hour expiration, avatar overlay).

## Backend Changes Applied ✅
1. **QR Code Expiration**: Changed from 5 minutes to 24 hours
2. **Avatar/Initials**: Backend now returns `avatar` field (e.g., "JD" for John Doe)
3. **No Auto-Refresh**: QR codes generate once and last 24 hours
4. **Manual Regeneration**: Students can manually regenerate if needed

## Testing Checklist

### 1. Student Dashboard - QR Code Generation

**Test Steps:**
1. Login as a student
2. Navigate to "My QR Code" section
3. Verify QR code displays with:
   - ✅ Large, centered QR code
   - ✅ Avatar/initials overlay in center of QR code
   - ✅ Student name and ID displayed
   - ✅ Timer showing "24h 0m" (or similar)
   - ✅ "Valid until [tomorrow's date/time]" message
   - ✅ "Regenerate QR Code" button

**Expected Behavior:**
- QR code generates once on page load
- Timer updates every minute (not every second)
- Timer color changes based on time left:
  - Green: > 12 hours
  - Yellow: 6-12 hours
  - Orange: 1-6 hours
  - Red: < 1 hour
- Avatar overlay displays user's initials in center
- No automatic refresh (stays for 24 hours)

**API Endpoint:**
```
GET /api/qr/generate
Authorization: Bearer <access_token>

Response:
{
  "qrData": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24 hours",
  "userInfo": {
    "name": "John Doe",
    "userType": "student",
    "id": "HARV-123456789",
    "avatar": "JD"
  }
}
```

### 2. Student Dashboard - Attendance History

**Test Steps:**
1. Navigate to "My Attendance" section
2. Verify attendance history displays:
   - ✅ List of attendance records
   - ✅ Date and time of each scan
   - ✅ Scanned by (lecturer/admin name)
   - ✅ Purpose and location (if provided)
   - ✅ Pagination controls (if > 20 records)

**Expected Behavior:**
- Shows most recent attendance first
- Pagination works (20 records per page)
- Empty state if no attendance records
- Loading spinner while fetching

**API Endpoint:**
```
GET /api/qr/attendance/my-history?page=1&limit=20
Authorization: Bearer <access_token>

Response:
{
  "attendance": [
    {
      "id": "...",
      "scannedAt": "2026-02-19T10:30:00.000Z",
      "scannedBy": {
        "name": "Prof. Jane Smith",
        "userType": "lecturer"
      },
      "purpose": "Lecture",
      "location": "Room 301"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalRecords": 45,
    "limit": 20
  }
}
```

### 3. Lecturer/Admin Dashboard - QR Scanner

**Test Steps:**
1. Login as lecturer or admin
2. Navigate to "QR Scanner" section
3. Click "Start Scanner"
4. Grant camera permissions
5. Scan a student's QR code
6. Verify scanned student info displays:
   - ✅ Student name
   - ✅ Student ID
   - ✅ Department
   - ✅ Year
   - ✅ University name
7. Optionally add purpose and location
8. Click "Mark Attendance"

**Expected Behavior:**
- Camera starts and displays live feed
- QR code auto-detected when in frame
- Scanner stops after successful scan
- Student info displays immediately
- "Mark Attendance" button works
- Success message after marking
- Form resets after 2 seconds
- Can scan another student

**API Endpoints:**
```
POST /api/qr/verify
Authorization: Bearer <access_token>
Body: { "qrData": "..." }

Response:
{
  "valid": true,
  "student": {
    "studentId": "HARV-123456789",
    "name": "John Doe",
    "department": "Computer Science",
    "year": "3rd Year",
    "universityName": "Harvard University"
  }
}

POST /api/qr/scan-attendance
Authorization: Bearer <access_token>
Body: {
  "qrData": "...",
  "purpose": "Lecture",
  "location": "Room 301"
}

Response:
{
  "message": "Attendance marked successfully",
  "student": {
    "studentId": "HARV-123456789",
    "name": "John Doe",
    "department": "Computer Science",
    "year": "3rd Year"
  },
  "scannedBy": {
    "name": "Prof. Jane Smith",
    "userType": "lecturer"
  },
  "scannedAt": "2026-02-19T10:30:00.000Z"
}
```

### 4. Lecturer/Admin Dashboard - Student History

**Test Steps:**
1. Navigate to "Student History" section
2. Enter a student ID in the search field
3. View student's attendance history
4. Verify pagination works

**Expected Behavior:**
- Search by student ID works
- Shows student info at top
- Lists all attendance records
- Pagination works correctly
- Empty state if no records

**API Endpoint:**
```
GET /api/qr/attendance/student/:studentId?page=1&limit=20
Authorization: Bearer <access_token>

Response:
{
  "student": {
    "studentId": "HARV-123456789",
    "name": "John Doe",
    "department": "Computer Science",
    "year": "3rd Year"
  },
  "attendance": [...],
  "pagination": {...}
}
```

## Common Issues & Solutions

### Issue 1: QR Code Not Displaying
**Symptoms:** Blank white box or error message
**Solutions:**
- Check browser console for errors
- Verify access token is valid
- Check API endpoint is reachable
- Ensure `react-qr-code` package is installed

### Issue 2: Avatar Not Showing in QR Center
**Symptoms:** QR code displays but no initials overlay
**Solutions:**
- Verify backend returns `avatar` field in response
- Check browser console for avatar value
- Ensure avatar overlay CSS positioning is correct

### Issue 3: Camera Not Starting
**Symptoms:** "Camera permission denied" or camera doesn't start
**Solutions:**
- Grant camera permissions in browser
- Use HTTPS (camera requires secure context)
- Check if another app is using camera
- Try different browser

### Issue 4: QR Code Not Scanning
**Symptoms:** Scanner runs but doesn't detect QR code
**Solutions:**
- Ensure QR code is well-lit
- Hold QR code steady in frame
- Try different distance from camera
- Ensure QR code is not expired (check timer)

### Issue 5: Attendance Not Marking
**Symptoms:** Scan succeeds but attendance doesn't save
**Solutions:**
- Check network tab for API errors
- Verify lecturer/admin has permission
- Check if QR code is expired
- Ensure backend is running

### Issue 6: Timer Not Updating
**Symptoms:** Timer shows wrong time or doesn't count down
**Solutions:**
- Check browser console for errors
- Verify expiration date calculation
- Ensure timer interval is running
- Refresh page to reset

## Performance Expectations

- **QR Generation:** < 1 second
- **QR Scanning:** < 2 seconds (after QR in frame)
- **Attendance Marking:** < 1 second
- **History Loading:** < 2 seconds (20 records)
- **Page Navigation:** Instant (client-side routing)

## Browser Compatibility

**Tested Browsers:**
- ✅ Chrome 90+ (Desktop & Mobile)
- ✅ Firefox 88+ (Desktop & Mobile)
- ✅ Safari 14+ (Desktop & Mobile)
- ✅ Edge 90+ (Desktop)

**Camera Requirements:**
- HTTPS connection (required for camera access)
- Camera permissions granted
- Modern browser with MediaDevices API support

## Mobile Testing

**Important Notes:**
- Use back camera for scanning (better quality)
- Ensure good lighting
- Hold phone steady
- QR code should fill ~50% of frame
- Tap to focus if needed

## Security Testing

**Verify:**
- ✅ QR codes expire after 24 hours
- ✅ Expired QR codes are rejected
- ✅ QR codes are institution-specific
- ✅ Only authenticated users can generate/scan
- ✅ JWT tokens are validated
- ✅ Cross-institution scanning is blocked

## Next Steps After Testing

1. **If all tests pass:**
   - Deploy to staging environment
   - Conduct user acceptance testing
   - Train lecturers and admins
   - Roll out to production

2. **If issues found:**
   - Document specific errors
   - Check browser console logs
   - Review API responses
   - Fix issues and retest

## Support & Debugging

**Enable Debug Mode:**
```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

**Check API Logs:**
```bash
# Backend logs
tail -f /var/log/campus-id/api.log
```

**Network Debugging:**
- Open browser DevTools (F12)
- Go to Network tab
- Filter by "qr" to see QR-related requests
- Check request/response details

## Contact

For issues or questions:
- Backend API: Check backend documentation
- Frontend: Review component code in `components/qr/`
- Integration: See `QR_SYSTEM_README.md`
