# Farewell Gallery Upload Guide

This folder powers the "Club Memories" gallery section on each person's farewell page.

## Upload path
Put photos in the member folder:
- /public/farewell-2k26/gallery/individual/<person-slug>/

Supported extensions:
- .jpg
- .jpeg
- .png
- .webp
- .gif

## Important step after uploads
Regenerate:
- /public/farewell-2k26/gallery/manifest.json

Use this PowerShell command:

```powershell
$galleryRoot = "C:\Anish\Website\Website\public\farewell-2k26\gallery"; $exts = @(".jpg", ".jpeg", ".png", ".webp", ".gif"); $individual = @{}; Get-ChildItem -Path (Join-Path $galleryRoot "individual") -Directory | ForEach-Object { $slug = $_.Name; $files = Get-ChildItem -Path $_.FullName -File -ErrorAction SilentlyContinue | Where-Object { $exts -contains $_.Extension.ToLower() } | Sort-Object Name | ForEach-Object { "/farewell-2k26/gallery/individual/$slug/$($_.Name)" }; $individual[$slug] = @($files) }; $manifest = [ordered]@{ individual = $individual }; $json = $manifest | ConvertTo-Json -Depth 8; Set-Content -Path (Join-Path $galleryRoot "manifest.json") -Value $json -Encoding UTF8;
```

If a member folder has no images, the page falls back to gallery images from farewell-data.js (if present).
