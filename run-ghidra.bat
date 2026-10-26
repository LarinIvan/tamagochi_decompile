@echo off
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%
echo Starting Ghidra 12.1.4 with JDK 21 (GhidraMCP compatible)...
start "" "%~dp0ghidra_12.1.4\ghidraRun.bat" %*
