@echo off
title EventSphere Backend Server (Port 8080)
echo =================================================================
echo  Starting EventSphere Spring Boot Backend on Port 8080...
echo =================================================================

set "JAVA_HOME=C:\Program Files\Java\jdk-25.0.3"
set "PATH=%JAVA_HOME%\bin;C:\Users\vamsh\.maven\maven-3.9.16\bin;%PATH%"

cd /d "%~dp0backend"
echo Java Home: %JAVA_HOME%
echo Current Dir: %CD%
echo.

call "C:\Users\vamsh\.maven\maven-3.9.16\bin\mvn.cmd" spring-boot:run

echo.
echo =================================================================
echo Backend server has stopped or failed to start.
echo =================================================================
pause
