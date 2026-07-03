[CmdletBinding()]
param(
    [string]$ApkPath = "outputs/mobile-artifacts/app-debug.apk",
    [string]$AdbPath = "private/tools/platform-tools/adb.exe",
    [string]$PackageName = "cloud.yuyay.hensai",
    [switch]$NoLaunch
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $AdbPath)) {
    $adbCommand = Get-Command adb -ErrorAction SilentlyContinue
    if (-not $adbCommand) {
        throw "adb was not found. Put Android Platform Tools at private/tools/platform-tools or install adb."
    }
    $AdbPath = $adbCommand.Source
}

if (-not (Test-Path -LiteralPath $ApkPath)) {
    throw "APK was not found at $ApkPath. Download the hensai-debug-apk artifact from the latest Mobile build check first."
}

& $AdbPath start-server | Out-Host
$deviceLines = & $AdbPath devices | Where-Object { $_ -match "`tdevice$" }

if (-not $deviceLines) {
    throw "No Android device is connected. Enable USB debugging, connect the phone, and approve the RSA prompt on the phone."
}

& $AdbPath install -r $ApkPath | Out-Host

if (-not $NoLaunch) {
    & $AdbPath shell monkey -p $PackageName -c android.intent.category.LAUNCHER 1 | Out-Host
}

Write-Host "Android debug APK installed."
