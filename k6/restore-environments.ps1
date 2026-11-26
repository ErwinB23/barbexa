param(
  [Parameter(Mandatory=$true)]
  [ValidateSet('habitual','repro','legacy','all')][string]$Environment,
  [switch]$PlanOnly
)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
$records = @()
if ($Environment -in @('habitual','all')) {
  $snapshot = Get-Content -LiteralPath '.artifacts/k6/before-stop.json' -Raw | ConvertFrom-Json
  $records += @($snapshot | Where-Object { $_.Name -match '_app-barberia-002-local$' -and $_.Running })
}
if ($Environment -in @('repro','legacy','all')) {
  $snapshot = Get-Content -LiteralPath '.artifacts/k6/other-stacks-before-stop.json' -Raw | ConvertFrom-Json
  $records += @($snapshot | Where-Object {
    ($Environment -eq 'all') -or
    ($Environment -eq 'repro' -and $_.Name -match '_app-barberia-002-repro-20261113$') -or
    ($Environment -eq 'legacy' -and $_.Name -match '_barberia-app$')
  })
}
if (-not $records.Count) { throw 'NO_RESTORATION_INVENTORY' }
# Validate every original ID and mount before starting any container.
foreach ($record in $records) {
  if ($record.Name -notmatch '^/?supabase_[a-z_]+_(app-barberia-002-local|app-barberia-002-repro-20261113|barberia-app)$') { throw 'UNEXPECTED_CONTAINER_NAME' }
  $current = (docker inspect $record.Id | ConvertFrom-Json)[0]
  if ($LASTEXITCODE -ne 0 -or $current.Id -ne $record.Id -or $current.Name.TrimStart('/') -ne $record.Name.TrimStart('/')) { throw 'ORIGINAL_CONTAINER_MISSING' }
  $originalMounts = @($record.Mounts | Select-Object Type,Name,Source,Destination) | ConvertTo-Json -Compress
  $currentMounts = @($current.Mounts | Select-Object Type,Name,Source,Destination) | ConvertTo-Json -Compress
  if ($originalMounts -ne $currentMounts) { throw 'MOUNTS_CHANGED_STOP_RESTORATION' }
}
foreach ($suffix in @('app-barberia-002-local','app-barberia-002-repro-20261113','barberia-app')) {
  $group = @($records | Where-Object { $_.Name.EndsWith("_$suffix") })
  if (-not $group.Count) { continue }
  $db = @($group | Where-Object { $_.Name.TrimStart('/') -eq "supabase_db_$suffix" })
  if ($db.Count -ne 1) { throw 'EXPECTED_ONE_ORIGINAL_DB' }
  $others = @($group | Where-Object { $_.Id -ne $db[0].Id })
  if ($PlanOnly) {
    Write-Output "docker start $($db[0].Name.TrimStart('/'))"
    Write-Output '# Esperar a healthy; el modo de ejecucion lo comprueba automaticamente.'
    Write-Output ('docker start ' + (($others | ForEach-Object { $_.Name.TrimStart('/') }) -join ' '))
    continue
  }
  docker start $db[0].Id | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'DB_RESTART_FAILED' }
  $deadline = [DateTime]::UtcNow.AddSeconds(120)
  do {
    $state = (docker inspect $db[0].Id | ConvertFrom-Json)[0].State
    if ($state.Health.Status -eq 'healthy') { break }
    Start-Sleep -Seconds 2
  } while ([DateTime]::UtcNow -lt $deadline)
  if ($state.Health.Status -ne 'healthy') { throw 'DB_NOT_HEALTHY_RESTORATION_PAUSED' }
  docker start @($others | ForEach-Object Id) | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'SERVICE_RESTART_FAILED' }
  Write-Output "Restaurados $($group.Count) contenedores originales de $suffix."
}
# Metro is deliberately separate and foreground; no protected log is touched.
