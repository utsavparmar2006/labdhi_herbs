# ==========================================================
#  Labdhi Herbs - AWS EC2 Deployment Script (PowerShell)
#  Usage: .\deploy.ps1
# ==========================================================

$EC2_IP   = "15.207.248.254"
$EC2_USER = "ubuntu"
$PEM_KEY  = "$PSScriptRoot\labdhi-key.pem"
$APP_DIR  = "/home/ubuntu/labdhi_herbs"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Labdhi Herbs - Deploying to AWS EC2      " -ForegroundColor Cyan
Write-Host "   Server: $EC2_IP" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# ── Check PEM key ────────────────────────────────────────
if (-Not (Test-Path $PEM_KEY)) {
    Write-Host "[ERROR] PEM key not found at: $PEM_KEY" -ForegroundColor Red
    exit 1
}

# Fix Windows PEM permissions
icacls $PEM_KEY /inheritance:r | Out-Null
icacls $PEM_KEY /remove "NT AUTHORITY\Authenticated Users" | Out-Null
icacls $PEM_KEY /remove "BUILTIN\Users" | Out-Null
icacls $PEM_KEY /grant:r "${env:USERNAME}:R" | Out-Null

function Invoke-SSH {
    param([string]$Command)
    ssh -i $PEM_KEY -o StrictHostKeyChecking=no "${EC2_USER}@${EC2_IP}" $Command
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Command failed: $Command" -ForegroundColor Red
        exit 1
    }
}

# ── Step 1: Pull latest code ─────────────────────────────
Write-Host "[1/5] Pulling latest code from GitHub..." -ForegroundColor Yellow
Invoke-SSH "cd $APP_DIR && git pull origin main"

# ── Step 2: Backend - Install dependencies ───────────────
Write-Host "[2/5] Installing Backend dependencies..." -ForegroundColor Yellow
Invoke-SSH "cd $APP_DIR/backend && npm install"

# ── Step 3: Backend - Build TypeScript ──────────────────
Write-Host "[3/5] Building Backend (TypeScript)..." -ForegroundColor Yellow
Invoke-SSH "cd $APP_DIR/backend && npm run build"

# ── Step 4: Frontend - Install & Build ──────────────────
Write-Host "[4/5] Building Frontend (Next.js)..." -ForegroundColor Yellow
Invoke-SSH "cd $APP_DIR/frontend && npm install"
Invoke-SSH "cd $APP_DIR/frontend && npm run build"

# ── Step 5: Restart with PM2 ────────────────────────────
Write-Host "[5/5] Restarting services with PM2..." -ForegroundColor Yellow
Invoke-SSH "pm2 restart labdhi-backend 2>/dev/null || pm2 start $APP_DIR/backend/dist/server.js --name labdhi-backend"
Invoke-SSH "pm2 restart labdhi-frontend 2>/dev/null || pm2 start npm --name labdhi-frontend -- start --prefix $APP_DIR/frontend"
Invoke-SSH "pm2 save"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host " SUCCESS! Deployment complete." -ForegroundColor Green
Write-Host " Live at: http://$EC2_IP" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

