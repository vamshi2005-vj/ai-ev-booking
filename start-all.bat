@echo off
title EventSphere Full-Stack Launcher
echo =================================================================
echo  Starting EventSphere (Frontend :5173 + Backend :8080)...
echo =================================================================

set "JAVA_HOME=C:\Program Files\Java\jdk-25.0.3"
set "PATH=%JAVA_HOME%\bin;C:\Users\vamsh\.maven\maven-3.9.16\bin;%PATH%"

start "EventSphere Frontend (:5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

cd /d "%~dp0backend"
call "C:\Users\vamsh\.maven\maven-3.9.16\bin\mvn.cmd" spring-boot:run

pause
