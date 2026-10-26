# Скрипт автоматической загрузки и распаковки Finch: Self-Care Pet (com.finch.finch)
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$xapkPath = Join-Path $scriptDir "com.finch.finch.xapk"
$downloadUrl = "https://d.apkpure.com/b/APK/com.finch.finch?version=latest"

Write-Host "Загрузка Finch: Self-Care Pet..." -ForegroundColor Cyan
$wc = New-Object System.Net.WebClient
$wc.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
$wc.DownloadFile($downloadUrl, $xapkPath)

Write-Host "Распаковка XAPK..." -ForegroundColor Cyan
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($xapkPath, $scriptDir)

Write-Host "Готово! Файлы приложения сохранены в $scriptDir" -ForegroundColor Green
