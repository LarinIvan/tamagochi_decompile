@echo off
set JAVA_HOME=C:\Users\larin\jdk-25
set PATH=%JAVA_HOME%\bin;%PATH%
echo Starting Ghidra 12.2 with JDK 25...
start "" "%~dp0ghidra\ghidraRun.bat" %*
