# ════════════════════════════════════════════════════════════════════════
#  Lokadia — Déploiement des Edge Functions Supabase
# ════════════════════════════════════════════════════════════════════════
#
#  Usage :
#    1. Récupère ton Personal Access Token : https://supabase.com/dashboard/account/tokens
#       Crée-en un avec le nom "Lokadia Lokascore deploy"
#    2. Lance ce script dans PowerShell :
#       cd C:\Users\tangu\Desktop\Lokadia
#       .\supabase\deploy-functions.ps1 -Token "sbp_xxxxxxxxxxxx"
#    3. Le script déploie les 4 fonctions et teste chacune
#
# ════════════════════════════════════════════════════════════════════════

param(
    [Parameter(Mandatory=$true)]
    [string]$Token,
    [string]$ProjectRef = "yprdlcqwloydwzxihepw"
)

$env:SUPABASE_ACCESS_TOKEN = $Token

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Lokadia — Déploiement des Edge Functions Supabase" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1 : Link project
Write-Host "1. Linking projet Supabase ($ProjectRef)..." -ForegroundColor Yellow
supabase link --project-ref $ProjectRef
if ($LASTEXITCODE -ne 0) {
    Write-Host "✘ Erreur de link, vérifie ton token" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Linké" -ForegroundColor Green
Write-Host ""

# Step 2 : Deploy 4 functions
$functions = @("advisories-mae", "advisories-fcdo", "advisories-us-state", "advisories-who")
foreach ($fn in $functions) {
    Write-Host "2. Déploiement $fn ..." -ForegroundColor Yellow
    supabase functions deploy $fn --no-verify-jwt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✘ Erreur déploiement $fn" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ $fn déployée" -ForegroundColor Green
    Write-Host ""
}

# Step 3 : Test chacune
Write-Host "3. Test des fonctions déployées..." -ForegroundColor Yellow
Write-Host ""

$baseUrl = "https://$ProjectRef.supabase.co/functions/v1"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwcmRsY3F3bG95ZHd6eGloZXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTk4NzcsImV4cCI6MjA4NzYzNTg3N30.8doZFPPL64Un6pnFgTp7L_x9xBht8YnkKrilgmYMhS4"

$tests = @(
    @{ Name="MAE Japon"; Url="$baseUrl/advisories-mae?country=japon" },
    @{ Name="MAE France"; Url="$baseUrl/advisories-mae?country=france" },
    @{ Name="FCDO Japan"; Url="$baseUrl/advisories-fcdo?country=japan" },
    @{ Name="US State JP"; Url="$baseUrl/advisories-us-state?country=JP" },
    @{ Name="WHO JP"; Url="$baseUrl/advisories-who?country=JP" }
)

foreach ($t in $tests) {
    try {
        $resp = Invoke-RestMethod -Uri $t.Url -Headers @{ Authorization = "Bearer $anonKey" } -TimeoutSec 10
        Write-Host "  ✓ $($t.Name): " -NoNewline -ForegroundColor Green
        Write-Host ($resp | ConvertTo-Json -Compress) -ForegroundColor Gray
    } catch {
        Write-Host "  ✘ $($t.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Déploiement terminé !" -ForegroundColor Green
Write-Host ""
Write-Host "  Les Lokascore vont maintenant utiliser les advisories LIVE de" -ForegroundColor White
Write-Host "  MAE France · UK FCDO · US State Dept · OMS Disease Outbreak" -ForegroundColor White
Write-Host ""
Write-Host "  Pour vérifier sur https://lokadia.fr ouvre la console (F12) et" -ForegroundColor White
Write-Host "  cherche les logs ' + ⚡ live MAE/FCDO/US/OMS' dans les badges." -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
