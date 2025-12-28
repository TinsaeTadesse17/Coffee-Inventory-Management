@echo off
echo.
echo ⚠️  IMPORTANT: Make sure your dev server is STOPPED before running this!
echo Press Ctrl+C now if it's still running, or any key to continue...
pause >nul

echo.
echo 📋 Running migration...
npx prisma migrate dev --name %1

echo.
echo ✅ Migration complete! Now run: npm run dev

