[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$KeystorePath,

    [string]$ServiceAccountJsonPath,

    [string]$Repo = "yuyay-cloud/Hensai.app",

    [string]$KeyAlias = "hensai-upload",

    [securestring]$KeystorePassword,

    [securestring]$KeyPassword,

    [switch]$SkipGooglePlayServiceAccount
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function ConvertTo-PlainText {
    param([Parameter(Mandatory = $true)][securestring]$Value)

    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
    try {
        [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
}

function Set-GitHubSecret {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Value
    )

    $Value | gh secret set $Name --repo $Repo | Out-Host
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "GitHub CLI 'gh' is required. Install it and run 'gh auth login' first."
}

gh auth status | Out-Host

$resolvedKeystorePath = (Resolve-Path -LiteralPath $KeystorePath).Path
if (-not $SkipGooglePlayServiceAccount) {
    if ([string]::IsNullOrWhiteSpace($ServiceAccountJsonPath)) {
        throw "ServiceAccountJsonPath is required unless -SkipGooglePlayServiceAccount is specified."
    }
    $resolvedServiceJsonPath = (Resolve-Path -LiteralPath $ServiceAccountJsonPath).Path
}

if (-not $KeystorePassword) {
    $KeystorePassword = Read-Host "Android keystore password" -AsSecureString
}

if (-not $KeyPassword) {
    $KeyPassword = Read-Host "Android key password" -AsSecureString
}

$keystorePasswordText = ConvertTo-PlainText $KeystorePassword
$keyPasswordText = ConvertTo-PlainText $KeyPassword

if ([string]::IsNullOrWhiteSpace($keystorePasswordText)) {
    throw "Android keystore password is empty."
}

if ([string]::IsNullOrWhiteSpace($keyPasswordText)) {
    throw "Android key password is empty."
}

$keystoreBase64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($resolvedKeystorePath))

Set-GitHubSecret "ANDROID_KEYSTORE_BASE64" $keystoreBase64
Set-GitHubSecret "ANDROID_KEYSTORE_PASSWORD" $keystorePasswordText
Set-GitHubSecret "ANDROID_KEY_ALIAS" $KeyAlias
Set-GitHubSecret "ANDROID_KEY_PASSWORD" $keyPasswordText

if ($SkipGooglePlayServiceAccount) {
    Write-Warning "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON was not registered. Android Play upload will still need this secret before it can upload to Google Play."
} else {
    $serviceAccountJson = Get-Content -Raw -Encoding UTF8 -LiteralPath $resolvedServiceJsonPath

    if ([string]::IsNullOrWhiteSpace($serviceAccountJson)) {
        throw "Google Play service account JSON is empty."
    }

    $serviceAccount = $serviceAccountJson | ConvertFrom-Json
    if ($serviceAccount.type -ne "service_account") {
        throw "The JSON file does not look like a Google service account key."
    }

    Set-GitHubSecret "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON" $serviceAccountJson
}

Write-Host ""
Write-Host "Android release secrets are registered for $Repo."
Write-Host "Registered secret names:"
gh secret list --repo $Repo | Out-Host
