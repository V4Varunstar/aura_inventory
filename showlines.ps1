$i=0
Get-Content services\\firebaseService.ts | ForEach-Object {
  $i++
  if ($i -ge 970 -and $i -le 1020) {
    Write-Host $i ':' $_
  }
}
