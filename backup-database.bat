@echo off
echo ============================================================================
echo                    DATABASE BACKUP SCRIPT
echo ============================================================================
echo.
echo Creating backup of your database before refactoring...
echo.

REM Get current date for backup folder name
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "datestamp=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"

echo Backup will be saved to: backup/before-refactor-%datestamp%
echo.

REM Create backup directory
if not exist "backup" mkdir backup

REM Run mongodump (you'll need to replace with your actual connection string)
echo Running mongodump...
mongodump --uri="%MONGODB_URI%" --out=backup/before-refactor-%datestamp%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Backup completed successfully!
    echo    Location: backup/before-refactor-%datestamp%
    echo.
) else (
    echo.
    echo ❌ Backup failed! Please check your MongoDB connection.
    echo    Make sure MONGODB_URI environment variable is set.
    echo.
    pause
    exit /b 1
)

echo ============================================================================
echo                    BACKUP COMPLETE
echo ============================================================================
pause