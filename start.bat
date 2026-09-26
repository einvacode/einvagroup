@echo off
SETLOCAL
cd /d "%~dp0"

title Einva Group Server

echo ==============================================
echo        MEMULAI APLIKASI EINVA GROUP
echo ==============================================
echo.

if not exist "node_modules\" (
    echo [1/3] Menginstal dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Gagal menginstal dependencies.
        pause
        exit /b %ERRORLEVEL%
    )
) else (
    echo [1/3] Dependencies sudah terpasang.
)

echo [2/3] Memeriksa skema database...
call npx prisma db push --skip-generate

echo [3/3] Menjalankan server aplikasi...
echo.
echo ==============================================
echo  Aplikasi dapat diakses di:
echo  ^>^>^> http://localhost:3000
echo ==============================================
echo Browser akan otomatis dibuka dalam beberapa detik...
echo.

start "" cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:3000"

call npm run dev

echo.
echo Server telah dihentikan.
pause
ENDLOCAL
