$ErrorActionPreference = "Stop"

$sdkDir = "C:\Users\larin\AppData\Local\Android\Sdk"
$zipPath = "$env:TEMP\cmdline-tools.zip"
$toolsUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"

Write-Host "=== 1. Создание папок Android SDK ==="
$latestDir = "$sdkDir\cmdline-tools\latest"
New-Item -ItemType Directory -Force -Path $latestDir | Out-Null

Write-Host "=== 2. Загрузка Command-Line Tools (146 MB) ==="
if (-not (Test-Path $zipPath)) {
    curl.exe -L -o $zipPath $toolsUrl
}

Write-Host "=== 3. Распаковка архива ==="
$extractTemp = "$env:TEMP\cmdline-extract"
if (Test-Path $extractTemp) { Remove-Item -Recurse -Force $extractTemp }
Expand-Archive -Path $zipPath -DestinationPath $extractTemp -Force

# Перемещаем содержимое cmdline-tools в $latestDir
Copy-Item -Path "$extractTemp\cmdline-tools\*" -Destination $latestDir -Recurse -Force
Remove-Item -Recurse -Force $extractTemp
Remove-Item -Force $zipPath

Write-Host "=== 4. Проверка sdkmanager ==="
$sdkManager = "$latestDir\bin\sdkmanager.bat"
if (-not (Test-Path $sdkManager)) {
    throw "sdkmanager.bat не найден по пути $sdkManager"
}

Write-Host "=== 5. Принятие лицензий Android SDK ==="
# Отправляем 'y' на все запросы лицензий
& cmd.exe /c "echo y | `"$sdkManager`" --sdk_root=`"$sdkDir`" --licenses"

Write-Host "=== 6. Установка platform-tools, platforms;android-34, build-tools;34.0.0 ==="
& cmd.exe /c "echo y | `"$sdkManager`" --sdk_root=`"$sdkDir`" `"platform-tools`" `"platforms;android-34`" `"build-tools;34.0.0`""

Write-Host "=== 7. Проверка установленных компонентов ==="
Get-ChildItem $sdkDir
Write-Host "Android SDK успешно установлен в $sdkDir"
