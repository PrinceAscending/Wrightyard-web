@echo off
setlocal
if not exist node_modules (
  echo [wrightyard] Installing production dependencies...
  call npm ci --omit=dev --no-audit --no-fund
  if errorlevel 1 exit /b 1
)
node dist\index.js
