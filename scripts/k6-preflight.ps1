param([string]$OutputPath = '.artifacts/k6/preflight.json', [int]$Level = 1,
  [ValidateSet('load','fixtures','startup')][string]$Purpose = 'load')

# Read-only readiness probe. Never starts Docker, connects to SQL or generates load.
$ErrorActionPreference = 'Stop'
$blockers = [System.Collections.Generic.List[string]]::new()
$resources = $null
try {
  $machine = Get-CimInstance Win32_ComputerSystem
  $operatingSystem = Get-CimInstance Win32_OperatingSystem
  $totalBytes = [double]$machine.TotalPhysicalMemory
  $freeBytes = [double]$operatingSystem.FreePhysicalMemory * 1KB
  $usedPercent = 100 * (1 - $freeBytes / $totalBytes)
  $resources = [ordered]@{
    logicalProcessors = $machine.NumberOfLogicalProcessors
    totalRamGiB = [math]::Round($totalBytes / 1GB, 2)
    freeRamGiB = [math]::Round($freeBytes / 1GB, 2)
    usedRamPercent = [math]::Round($usedPercent, 2)
  }
} catch {
  $blockers.Add('RESOURCE_PROBE_UNAVAILABLE')
}
$adaptive = $null
try {
  $probeFile = Join-Path (Split-Path -Parent $PSScriptRoot) 'k6/resource-probe.mjs'
  $raw = & node $probeFile $Purpose $Level
  $adaptive = ($raw -join "`n") | ConvertFrom-Json
  foreach ($reason in $adaptive.blockers) { $blockers.Add($reason) }
} catch { $blockers.Add('ADAPTIVE_POLICY_UNAVAILABLE') }

$k6Command = Get-Command k6 -ErrorAction SilentlyContinue
$k6Executable = if ($k6Command) { $k6Command.Source } elseif (Test-Path -LiteralPath 'C:\Program Files\k6\k6.exe') { 'C:\Program Files\k6\k6.exe' } else { $null }
$k6Available = [bool]$k6Executable
if (-not $k6Available) { $blockers.Add('K6_NOT_ON_PATH') }
$dockerAvailable = [bool](Get-Command docker -ErrorAction SilentlyContinue)
$dockerReady = $false
if ($dockerAvailable) {
  try {
    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $ignoredVersion = & docker info --format '{{.ServerVersion}}' 2>$null
    $dockerReady = $LASTEXITCODE -eq 0
  } catch { $dockerReady = $false }
  finally { $ErrorActionPreference = $previousPreference }
}
if (-not $dockerReady) { $blockers.Add('DOCKER_ENGINE_UNAVAILABLE') }

$result = [ordered]@{
  observedAtUtc = [DateTime]::UtcNow.ToString('o')
  scope = 'Read-only host readiness; no backend or load execution'
  resources = $resources
  safetyPolicy = $adaptive
  k6OnPath = [bool]$k6Command
  k6Available = $k6Available
  dockerClientAvailable = $dockerAvailable
  dockerEngineReady = $dockerReady
  hostReadiness = if ($blockers.Count) { 'blocked' } else { 'ready-for-isolated-lab-preparation' }
  blockers = @($blockers.ToArray())
  targetValidated = $false
  loadExecuted = $false
  note = 'Host readiness is not authorization to run; an owned independent lab and synthetic fixtures must be verified separately.'
}
$outputFile = [IO.Path]::GetFullPath($OutputPath)
[IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($outputFile)) | Out-Null
[IO.File]::WriteAllText($outputFile, ($result | ConvertTo-Json -Depth 5) + "`n", [Text.UTF8Encoding]::new($false))
Write-Output ("Preflight: " + $result.hostReadiness + ". RAM libre: " + $resources.freeRamGiB + " GiB. Evidencia: " + $OutputPath)
if ($adaptive.warnings.Count) { Write-Output 'Aviso: margen estimado bajo; se mantienen vigilancia y abortos por saturacion.' }
if ($blockers.Count) { exit 2 }
exit 0
