@echo off
echo ========================================
echo  Campus ID Frontend - Ngrok Tunnel
echo ========================================
echo.
echo Starting Ngrok tunnel on port 3000...
echo.
echo IMPORTANT:
echo 1. Make sure Next.js is running first!
echo 2. Copy the HTTPS URL from below
echo 3. Open it on your mobile browser
echo.
echo Press Ctrl+C to stop
echo ========================================
echo.

ngrok http 3000
