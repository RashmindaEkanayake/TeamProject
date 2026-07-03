@echo off
setlocal
set "DIRNAME=%~dp0"
if "%DIRNAME:~-1%"=="\" set "DIRNAME=%DIRNAME:~0,-1%"
set "JAVA_CMD=java.exe"
if defined JAVA_HOME (
  if exist "%JAVA_HOME%\bin\java.exe" (
    set "JAVA_CMD=%JAVA_HOME%\bin\java.exe"
  )
)
if not exist "%DIRNAME%\.mvn\wrapper\maven-wrapper.jar" (
  echo ERROR: Maven wrapper jar not found. Expected %DIRNAME%\.mvn\wrapper\maven-wrapper.jar
  exit /b 1
)
"%JAVA_CMD%" -Dmaven.multiModuleProjectDirectory="%DIRNAME%" -cp "%DIRNAME%\.mvn\wrapper\maven-wrapper.jar" org.apache.maven.wrapper.MavenWrapperMain %*
endlocal
