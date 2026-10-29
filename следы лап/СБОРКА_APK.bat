@echo off
chcp 65001 > nul
echo 📱 Сборка Android APK пакета «След Лапы»...
echo ----------------------------------------------------
cd client
echo 1. Сборка веб-бандла...
call npm run build
echo 2. Синхронизация Capacitor Android...
call npx cap sync android
echo 3. Сборка APK через Gradle...
cd android
call gradlew.bat assembleDebug
echo ----------------------------------------------------
echo Готовый APK находится в: client\android\app\build\outputs\apk\debug\app-debug.apk
pause
