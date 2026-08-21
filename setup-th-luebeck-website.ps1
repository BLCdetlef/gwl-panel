$ProjectPath = 'C:\Users\haud\Documents\GitHub\TH-Luebeck-Website'

$Directories = @(
    $ProjectPath
    (Join-Path $ProjectPath 'redaktionsrichtlinien')
    (Join-Path $ProjectPath 'screenshots')
    (Join-Path $ProjectPath 'textentwuerfe')
)

foreach ($Directory in $Directories) {
    New-Item -ItemType Directory -Path $Directory -Force | Out-Null
    Write-Host "Ordner vorhanden: $Directory"
}

Write-Host "`nProjektordner wurde eingerichtet: $ProjectPath"
