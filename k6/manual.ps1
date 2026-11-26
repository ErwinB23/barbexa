# Dot-source from the project root: . .\k6\manual.ps1
$script:BarbexaK6Root = Split-Path -Parent $PSScriptRoot
function Initialize-BarbexaFixtures {
  param([ValidateSet(1,10,25,50,100,200,300,400,500,600,700,800,900,1000)][int]$Vu = 1)
  Set-Location -LiteralPath $script:BarbexaK6Root
  powershell.exe -NoProfile -File scripts/k6-preflight.ps1 -Purpose fixtures -Level 1
  if ($LASTEXITCODE -ne 0) { throw 'Recursos insuficientes para preparar fixtures; no se inicia carga.' }
  $actors = [math]::Max(2,$Vu)
  node k6/fixtures.mjs prepare "--actors=$actors" "--level=$Vu"
  if ($LASTEXITCODE -ne 0) { throw 'Preparacion pausada. Conserva el manifiesto y repite este comando tras resolver el motivo.' }
  node k6/fixtures.mjs verify "--level=$Vu"
  if ($LASTEXITCODE -ne 0) { throw 'La verificacion del laboratorio no aprobo.' }
}
function Invoke-BarbexaLoad {
  param([Parameter(Mandatory=$true)][ValidateSet(1,10,25,50,100,200,300,400,500,600,700,800,900,1000)][int]$Vu,
    [ValidateSet('read','conflict','replay','isolation')][string]$Mode = 'read')
  Set-Location -LiteralPath $script:BarbexaK6Root
  if ($Vu -ne 1 -and $Mode -ne 'read') { throw 'Modos de integridad solo en humo.' }
  powershell.exe -NoProfile -File scripts/k6-preflight.ps1 -Purpose load -Level $Vu
  if ($LASTEXITCODE -ne 0) { throw 'Preflight bloqueado: revisar recursos/calibracion; no forzar.' }
  node k6/run-lab.mjs --execute=local-synthetic-lab "--level=$Vu" "--mode=$Mode" --fixtures=.artifacts/k6/supabase-lab/fixtures.json
  if ($LASTEXITCODE -ne 0) { throw 'Corrida no aprobada. Revisar sus evidencias antes de continuar.' }
}
