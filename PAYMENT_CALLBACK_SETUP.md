# Payment Callback Setup - URGENT FIX ✅

## Issue Fixed
Payment callback page created to verify Paystack payments and credit wallet.

---

## Callback Page Created

**Location**: `app/payment/callback/page.tsx`

**URL**: `https://smartunivid.xyz/payment/callback`

---

## How It Works

### 1. User Initiates Top-Up
- User clicks "Top Up" in wallet
- Enters amount (e.g., ₦5000)
- Frontend calls `POST /api/payments/wallet/topup`
- Backend returns:
  ```json
  {
    "reference": "TOPUP_1772835795352_668951",
    "authorizationUrl": "https://checkout.paystack.com/abc123"
  }
  ```

### 2. Redirect to Paystack
- User redirected to `authorizationUrl`
- User completes payment on Paystack
- Paystack redirects back to callback URL

### 3. Callback URL (CRITICAL)
Paystack redirects to:
```
https://smartunivid.xyz/payment/callback?reference=TOPUP_1772835795352_668951
```

### 4. Verification Process
The callback page automatically:
1. ✅ Extracts `reference` from URL query params
2. ✅ Shows "Verifying Payment" loading state
3. ✅ Calls `GET /api/payments/verify/{reference}`
4. ✅ Backend verifies with Paystack
5. ✅ Backend credits wallet
6. ✅ Returns new balance
7. ✅ Shows success message
8. ✅ Redirects to wallet page after 3 seconds

---

## Backend Requirements

### Paystack Configuration

**IMPORTANT**: Backend must configure Paystack callback URL:

```javascript
// When initializing Paystack payment
const paystackData = {
  email: user.email,
  amount: amount * 100, // Convert to kobo
  reference: reference,
  callback_url: 'https://smartunivid.xyz/payment/callback' // ← ADD THIS
};
```

### Verify Endpoint

**Endpoint**: `GET /api/payments/verify/{reference}`

**What it should do**:
1. Extract reference from URL params
2. Call Paystack verify API: `GET https://api.paystack.co/transaction/verify/{reference}`
3. Check if payment was successful
4. If successful:
   - Credit user's wallet
   - Save transaction record
   - Return new balance
5. If failed:
   - Return error message

**Response Format**:
```json
{
  "message": "Payment verified successfully",
  "status": "success",
  "amount": 5000,
  "reference": "TOPUP_1772835795352_668951",
  "newBalance": 10000
}
```

---

## User Experience

### Verifying State
```
🔄 Verifying Payment
Please wait while we confirm your payment...

💳 Processing
This may take a few seconds
```

### Success State
```
✅ Payment Successful!
Payment verified successfully!

Amount Credited
₦5,000

New Wallet Balance
₦10,000

🔄 Redirecting to wallet...
```

### Failed State
```
❌ Payment Verification Failed
[Error message]

⚠️ What to do:
If money was deducted, please contact support 
with your transaction reference.

[Go to Wallet] [Retry Verification]
```

---

## Testing Flow

### Test Successful Payment:

1. Go to dashboard → Payments
2. Click "Top Up"
3. Enter ₦1000
4. Click "Continue to Payment"
5. Complete payment on Paystack test mode
6. Paystack redirects to `/payment/callback?reference=...`
7. See "Verifying Payment" screen
8. See "Payment Successful!" with new balance
9. Auto-redirect to wallet page
10. Verify balance updated

### Test Failed Payment:

1. Follow steps 1-4 above
2. Close Paystack popup (cancel payment)
3. Manually go to `/payment/callback?reference=INVALID_REF`
4. See "Payment Verification Failed"
5. Click "Retry Verification" or "Go to Wallet"

---

## Important Notes

### For Backend Team:

1. **Callback URL Configuration**
   - Set in Paystack dashboard: Settings → API Keys & Webhooks
   - Or pass in payment initialization request
   - URL: `https://smartunivid.xyz/payment/callback`

2. **Verify Endpoint Must**:
   - Call Paystack verify API
   - Credit wallet ONLY if Paystack confirms success
   - Return new balance
   - Handle duplicate verification (idempotent)

3. **Security**:
   - Verify payment with Paystack (don't trust frontend)
   - Check payment hasn't been verified before
   - Ensure amount matches original request

### For Frontend:

1. **Callback Page**:
   - ✅ Extracts reference from URL
   - ✅ Calls verify API
   - ✅ Shows loading/success/error states
   - ✅ Redirects to wallet after success
   - ✅ Allows retry on failure

2. **Dashboard**:
   - ✅ Accepts `?section=payments` query param
   - ✅ Navigates to payments section
   - ✅ Refreshes wallet balance

---

## Paystack Test Cards

For testing in Paystack test mode:

**Successful Payment**:
- Card: `4084 0840 8408 4081`
- CVV: `408`
- Expiry: Any future date
- PIN: `0000`
- OTP: `123456`

**Failed Payment**:
- Card: `5060 6666 6666 6666`
- CVV: Any
- Expiry: Any future date

---

## Troubleshooting

### Payment successful but wallet not credited:

**Check**:
1. Is callback URL configured in Paystack?
2. Is verify endpoint being called?
3. Is verify endpoint calling Paystack API?
4. Is wallet being credited in database?
5. Check backend logs for errors

### Callback page shows error:

**Check**:
1. Is reference in URL?
2. Is verify endpoint accessible?
3. Is user authenticated (token valid)?
4. Check browser console for errors
5. Check network tab for API calls

### Redirect not working:

**Check**:
1. Is Paystack callback URL correct?
2. Is domain accessible (not localhost)?
3. Check Paystack dashboard for webhook logs

---

## Files Created

1. `app/payment/callback/page.tsx` - Payment verification page

## Files Modified

1. `app/test-dashboard/page.tsx` - Added section query param handling

---

## Next Steps

1. ✅ Configure Paystack callback URL in backend
2. ✅ Test with Paystack test cards
3. ✅ Verify wallet is credited
4. ✅ Test error scenarios
5. ✅ Deploy to production

---

## Critical Success Factors

1. ✅ Callback URL must be configured in Paystack
2. ✅ Verify endpoint must call Paystack API
3. ✅ Wallet must be credited only after Paystack confirms
4. ✅ Frontend must extract reference from URL
5. ✅ User must see clear success/failure messages

**The payment flow is now complete and ready for testing!**
