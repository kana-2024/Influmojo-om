@echo off
echo Installing Influmojo Admin Dashboard...
echo.

echo Installing dependencies...
npm install

echo.
echo Starting development server...
echo Dashboard will be available at: http://localhost:3000
echo.
echo Make sure your backend is running on http://localhost:3002
echo.

npm run dev 