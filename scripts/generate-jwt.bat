@echo off
echo 🔐 Generating JWT token for Super Admin...
echo.

REM Base URL (update this with your actual ngrok URL)
set BASE_URL=https://fair-legal-gar.ngrok-free.app

REM Super Admin credentials
set EMAIL=admin@influmojo.com
set PASSWORD=admin123

echo 📧 Attempting login with: %EMAIL%
echo 🔗 URL: %BASE_URL%/api/auth/login
echo.

REM Curl command to login and get JWT token
curl -X POST "%BASE_URL%/api/auth/login" ^
  -H "Content-Type: application/json" ^
  -H "ngrok-skip-browser-warning: true" ^
  -d "{\"email\": \"%EMAIL%\", \"password\": \"%PASSWORD%\"}"

echo.
echo 🎯 If successful, copy the 'token' value from the response above.
echo 🔑 Use this token in the Authorization header: Bearer YOUR_TOKEN_HERE
pause 