@echo off

REM Build the React application
echo Building React application...
npm run build

REM Create deployment package (requires 7-zip or similar)
echo Creating deployment package...
powershell Compress-Archive -Path "dist\*" -DestinationPath "reform-construction-build.zip" -Force

echo Build complete! Upload reform-construction-build.zip to your DigitalOcean droplet.
echo.
echo On your droplet, extract the files to /var/www/html/
