# Backend Avatar Requirements - Complete Guide

## Overview
The frontend now displays user profile photos in multiple locations. The backend needs to include the `avatar` field in API responses.

---

## 1. QR Code Generation API

**Endpoint**: `GET /api/qr/generate`

**Current Response**:
```json
{
  "qrData": "encrypted_qr_string",
  "expiresIn": "24h",
  "userInfo": {
    "name": "Olumide Andre",
    "userType": "student",
    "id": "UNILAG-331593029"
  }
}
```

**Required Response**:
```json
{
  "qrData": "encrypted_qr_string",
  "expiresIn": "24h",
  "userInfo": {
    "name": "Olumide Andre",
    "userType": "student",
    "id": "UNILAG-331593029",
    "avatar": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  }
}
```

**Implementation**:
- Fetch the user's profile when generating QR code
- Include the `avatar` field from user's profile
- If user has no avatar, return `null` or empty string

**Frontend Display**:
- Shows profile photo in QR code overlay (center of QR)
- If no avatar: shows initials calculated from name

---

## 2. QR Code Verification API

**Endpoint**: `POST /api/qr/verify`

**Current Response**:
```json
{
  "message": "QR code verified successfully",
  "verified": true,
  "userType": "student",
  "userInfo": {
    "studentId": "UNILAG-331593029",
    "firstName": "Olumide",
    "lastName": "Andre",
    "email": "olumide@example.com",
    "department": "Computer Science",
    "year": "Year 2",
    "avatar": "Pf647",  // ← WRONG: This should be base64 image or null
    "institutionName": "University of Lagos",
    "status": "active",
    "emailVerified": true
  },
  "scannedBy": { ... },
  "scannedAt": "2024-03-06T10:30:00Z"
}
```

**Required Response**:
```json
{
  "message": "QR code verified successfully",
  "verified": true,
  "userType": "student",
  "userInfo": {
    "studentId": "UNILAG-331593029",
    "firstName": "Olumide",
    "lastName": "Andre",
    "email": "olumide@example.com",
    "department": "Computer Science",
    "year": "Year 2",
    "avatar": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",  // ← CORRECT: Full base64 image
    "institutionName": "University of Lagos",
    "status": "active",
    "emailVerified": true
  },
  "scannedBy": { ... },
  "scannedAt": "2024-03-06T10:30:00Z"
}
```

**Implementation**:
- When verifying QR code, fetch the full user profile
- Include the complete `avatar` field (base64 string with data URI)
- **DO NOT** return random strings like "Pf647" - this breaks the display

**Frontend Display**:
- Shows large profile photo (96x96px) when lecturer scans student QR
- If no avatar: shows initials (e.g., "OA" for Olumide Andre)
- Also displays: name, ID, department, year, email, status

---

## 3. Profile API (Already Working)

**Endpoint**: `GET /api/users/profile`

**Current Response** (Correct):
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "student@example.com",
  "userType": "student",
  "status": "active",
  "profile": {
    "firstName": "Olumide",
    "lastName": "Andre",
    "studentId": "UNILAG-331593029",
    "department": "Computer Science",
    "year": "Year 2",
    "phone": "+234 801 234 5678",
    "address": "Lagos, Nigeria",
    "dateOfBirth": "2000-01-15T00:00:00.000Z",
    "avatar": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",  // ← This is correct
    "universityName": "University of Lagos"
  },
  "institutionId": "507f1f77bcf86cd799439012"
}
```

**Status**: ✅ Already correct - no changes needed

---

## Avatar Format Requirements

### Correct Format:
```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMT...
```

### Format Breakdown:
- **Prefix**: `data:image/[type];base64,`
- **Type**: `jpeg`, `png`, `gif`, `webp`
- **Data**: Base64 encoded image data

### When User Has No Avatar:
Return one of:
- `null`
- `""` (empty string)
- Omit the field entirely

**DO NOT** return:
- Random strings like "Pf647"
- Placeholder text
- File paths
- URLs (unless you want to serve images separately)

---

## Frontend Behavior Summary

### 1. Student Dashboard
- **Sidebar avatar** (40x40px): Photo or initials
- **Header avatar** (40x40px): Photo or initials
- **Profile page** (128x128px): Photo or initials

### 2. Student QR Code Display
- **QR overlay** (48x48px): Photo or initials in center of QR code

### 3. Lecturer Scanner View
- **Scanned student card** (96x96px): Photo or initials
- Shows after successful QR scan
- Displays full student info with photo

### Initials Calculation:
```javascript
// Frontend automatically calculates from name
"Olumide Andre" → "OA"
"John Doe" → "JD"
"Alice" → "A"
```

---

## Testing Checklist

### For Backend Team:

**QR Generation**:
- [ ] Generate QR for student with avatar → returns base64 image
- [ ] Generate QR for student without avatar → returns null/empty
- [ ] Avatar field matches format from profile API

**QR Verification**:
- [ ] Scan student with avatar → returns base64 image
- [ ] Scan student without avatar → returns null/empty
- [ ] No random strings like "Pf647" in avatar field
- [ ] Avatar is complete base64 with data URI prefix

**Profile API**:
- [ ] Upload avatar → saves to database
- [ ] Get profile → returns saved avatar
- [ ] Avatar persists across sessions

---

## Priority

**High Priority**:
- Fix QR verification API (currently returning "Pf647" instead of image)
- Include avatar in QR generation API

**Impact**:
- Improves user experience
- Makes student identification easier for lecturers
- Professional appearance of digital ID cards

---

## Questions?

If you need clarification on:
- Avatar format
- Where to fetch avatar data
- How to test the changes

Please reach out to the frontend team!
