@echo off
cd /d "%~dp0backend"
echo ====================================================
echo Starting Backend Spring Boot Server (Port 8080)...
echo ====================================================
"C:\Users\rashm\.m2\wrapper\dists\apache-maven-3.9.9-bin\1ov53krssfqbsceju6rjojo5n2\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run
pause
