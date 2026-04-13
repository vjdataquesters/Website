# Intro Animation Upload Guide

This folder is used only for the opening animation photos.
It is separate from each person's gallery section.

## Common photos (shared)
Put shared images in:
- /public/farewell-2k26/intro/common/

Any file name is supported (.jpg, .jpeg, .png, .webp).

## Individual photos
Put person-specific images in:
- /public/farewell-2k26/intro/individual/<person-slug>/

Any file name is supported (.jpg, .jpeg, .png, .webp).

Current slugs are based on route keys in farewell-data.js (for example: vardhan, akhileshwar, sathvik-k).

## Important: regenerate manifest after uploads
The page reads image paths from:
- /public/farewell-2k26/intro/manifest.json

After adding/removing intro photos, regenerate the manifest by running this in PowerShell:

```powershell
$introRoot = "C:\Anish\Website\Website\public\farewell-2k26\intro"; $commonRoot = Join-Path $introRoot "common"; $individualRoot = Join-Path $introRoot "individual"; $exts = @(".jpg", ".jpeg", ".png", ".webp"); $common = @(); if (Test-Path $commonRoot) { $common = Get-ChildItem -Path $commonRoot -File | Where-Object { $exts -contains $_.Extension.ToLower() } | Sort-Object Name | ForEach-Object { "/farewell-2k26/intro/common/$($_.Name)" } }; $individual = @{}; if (Test-Path $individualRoot) { Get-ChildItem -Path $individualRoot -Directory | ForEach-Object { $slug = $_.Name; $files = Get-ChildItem -Path $_.FullName -File | Where-Object { $exts -contains $_.Extension.ToLower() } | Sort-Object Name | ForEach-Object { "/farewell-2k26/intro/individual/$slug/$($_.Name)" }; $individual[$slug] = @($files) } }; $manifest = [ordered]@{ common = @($common); individual = $individual }; $json = $manifest | ConvertTo-Json -Depth 8; Set-Content -Path (Join-Path $introRoot "manifest.json") -Value $json -Encoding UTF8;
```

## Selection behavior in opening animation
- Each load picks a randomized set from manifest data.
- It uses 2-3 common images and fills the rest with person-specific images.
- Image-to-position mapping is shuffled each load, so slots are not fixed.

If an image is missing, the UI falls back to a temporary placeholder image automatically.
