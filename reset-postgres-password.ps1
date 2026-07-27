# Requires running as Administrator
$ErrorActionPreference = "Stop"

$pgData = "C:\Program Files\PostgreSQL\18\data"
$serviceName = "postgresql-x64-18"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$newPassword = "Admin12345"

Write-Host "Stopping PostgreSQL service..."
Stop-Service -Name $serviceName -Force

Write-Host "Backing up pg_hba.conf..."
Copy-Item "$pgData\pg_hba.conf" "$pgData\pg_hba.conf.bak" -Force

Write-Host "Switching to trust authentication..."
(Get-Content "$pgData\pg_hba.conf") -replace 'scram-sha-256', 'trust' | Set-Content "$pgData\pg_hba.conf"

Write-Host "Starting PostgreSQL service..."
Start-Service -Name $serviceName
Start-Sleep -Seconds 5

Write-Host "Resetting postgres password..."
& $psql -U postgres -c "ALTER USER postgres WITH PASSWORD '$newPassword';"

Write-Host "Restoring pg_hba.conf..."
Copy-Item "$pgData\pg_hba.conf.bak" "$pgData\pg_hba.conf" -Force
Remove-Item "$pgData\pg_hba.conf.bak" -Force

Write-Host "Restarting PostgreSQL service..."
Restart-Service -Name $serviceName -Force

Write-Host "Done. postgres password is now: $newPassword"
