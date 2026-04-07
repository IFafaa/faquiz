# Automatiza: Postgres (Docker) -> migrate -> seed -> build -> API (node) -> npm run verify:api
# Uso (na raiz do repo faquiz): powershell -ExecutionPolicy Bypass -File scripts/verify-api-full.ps1
# Com Postgres ja local: powershell -File scripts/verify-api-full.ps1 -SkipDocker

param(
    [switch]$SkipDocker,
    [string]$AdminSeedPassword = "admin123"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

function Wait-TcpPort {
    param([string]$HostName = "127.0.0.1", [int]$Port, [int]$MaxSeconds = 90)
    $deadline = (Get-Date).AddSeconds($MaxSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $c = New-Object System.Net.Sockets.TcpClient
            $c.Connect($HostName, $Port)
            $c.Close()
            return $true
        } catch {
            Start-Sleep -Seconds 1
        }
    }
    return $false
}

if (-not $SkipDocker) {
    Write-Host ">> docker compose up -d db"
    docker compose up -d db
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "Falha ao subir o Postgres. Inicie o Docker Desktop e tente de novo,"
        Write-Host "ou suba o PostgreSQL em localhost:5432 e rode:"
        Write-Host "  powershell -File scripts/verify-api-full.ps1 -SkipDocker"
        exit 1
    }
    Write-Host ">> Aguardando porta 5432..."
    if (-not (Wait-TcpPort -Port 5432 -MaxSeconds 90)) {
        Write-Host "Timeout esperando PostgreSQL na porta 5432."
        exit 1
    }
} else {
    Write-Host ">> Pulando Docker (-SkipDocker). Verificando localhost:5432..."
    if (-not (Wait-TcpPort -Port 5432 -MaxSeconds 5)) {
        Write-Host "Nada escutando em localhost:5432. Inicie o banco antes."
        exit 1
    }
}

$ApiDir = Join-Path $RepoRoot "faquiz-api"
Set-Location $ApiDir

Write-Host ">> prisma migrate deploy"
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$env:ADMIN_SEED_PASSWORD = $AdminSeedPassword
Write-Host ">> prisma seed"
npm run prisma:seed
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ">> npm run build"
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$mainJs = Join-Path $ApiDir "dist\src\main.js"
if (-not (Test-Path $mainJs)) {
    Write-Host "Arquivo nao encontrado: $mainJs"
    exit 1
}

Write-Host ">> Iniciando API (node dist/src/main.js)..."
$proc = Start-Process -FilePath "node" -ArgumentList $mainJs -WorkingDirectory $ApiDir -PassThru -WindowStyle Hidden

if (-not (Wait-TcpPort -Port 3333 -MaxSeconds 120)) {
    Write-Host "Timeout esperando API na porta 3333."
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host ">> npm run verify:api"
npm run verify:api
$verifyExit = $LASTEXITCODE

Write-Host ">> Encerrando API (PID $($proc.Id))..."
Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
Get-CimInstance Win32_Process -Filter "ParentProcessId=$($proc.Id)" -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

exit $verifyExit
