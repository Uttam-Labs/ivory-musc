$ErrorActionPreference = "Stop"
$config = @{}
Get-Content ".env" | ForEach-Object {
  if ($_ -match '^([^#=]+)=(.*)$') { $config[$matches[1].Trim()] = $matches[2].Trim() }
}
$headers = @{ Authorization = "Bearer $($config.SANITY_API_READ_TOKEN)" }
$document = @{
  _id = "collectionPage"
  _type = "collectionPage"
  heading = "Collection"
}
$payload = @{ mutations = @(@{ createOrReplace = $document }) } | ConvertTo-Json -Depth 10 -Compress
$url = "https://$($config.NEXT_PUBLIC_SANITY_PROJECT_ID).api.sanity.io/v2025-02-19/data/mutate/$($config.NEXT_PUBLIC_SANITY_DATASET)"
$result = Invoke-RestMethod -Method Post -Uri $url -Headers $headers -ContentType "application/json" -Body ([Text.Encoding]::UTF8.GetBytes($payload))
Write-Output "Collection page settings created: $($result.results.Count) document."
