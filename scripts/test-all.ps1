# Executa testes do backend (api) e do frontend (web) em sequência
param(
    [switch]$Watch
)

$ErrorActionPreference = 'Stop'

Write-Host "[1/2] API tests" -ForegroundColor Cyan
npm --prefix ..\api run test --silent
if ($LASTEXITCODE -ne 0) {
  throw "API tests failed"
}

Write-Host "[2/2] Web tests" -ForegroundColor Cyan
$webArgs = @('run','test','--silent')
if ($Watch) { $webArgs += '--watch' }
npm --prefix ..\web @webArgs
if ($LASTEXITCODE -ne 0) {
  throw "Web tests failed"
}

Write-Host "All tests passed" -ForegroundColor Green
