@echo off
echo Cleaning build cache...
if exist .next (
    rmdir /s /q .next
    echo Cache deleted!
) else (
    echo No cache found
)
echo.
echo Building project...
npm run build


