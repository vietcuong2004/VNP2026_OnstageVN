$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$source = Join-Path $projectRoot 'public/mock_data/templates/sample_profiles_production.csv'
$imageRoot = Join-Path $projectRoot 'public/mock_data/Talent_Image'
$outputPath = Join-Path $projectRoot 'public/mock_data/profiles.json'

# Allowlist public profile fields; never copy the users/account CSV into the website.
$fields = @(
    'id', 'display_name', 'talent_types', 'city', 'district', 'gender',
    'birth_date', 'height_cm', 'weight_kg', 'measurements', 'languages',
    'education', 'experience', 'skills', 'experience_years', 'bio', 'price',
    'tier', 'profile_completion', 'rating', 'verification_status', 'created_at'
)
$arrayFields = @('talent_types', 'languages', 'skills')

function New-MockSocialAccount {
    param([int]$ProfileId, [int]$Slot, [string]$Platform, [string]$Handle, [string]$Url)

    $seed = $ProfileId * 7919 + $Slot * 104729
    $followers = 12000 + ($seed % 890000)
    $engagement = [math]::Round(2.1 + ($seed % 640) / 100.0, 2)
    $views = [int]($followers * (0.18 + ($seed % 65) / 100.0))
    [ordered]@{
        id = "demo-social-$ProfileId-$Slot"
        platform = $Platform
        handle = $Handle
        username = $Handle
        url = $Url
        followers_count = $followers
        likes_count = $followers * (8 + $Slot)
        engagement_rate = $engagement
        metrics = [ordered]@{
            avg_views = $views.ToString('N0', [cultureinfo]'vi-VN')
            interaction = "$($engagement.ToString('0.00', [cultureinfo]'vi-VN'))%"
        }
    }
}

$ghostIds = @{}
Import-Csv -LiteralPath (Join-Path $projectRoot 'public/mock_data/templates/sample_users_production.csv') -Encoding UTF8 |
    Where-Object { $_.is_ghost -eq '1' } | ForEach-Object { $ghostIds[$_.id] = $true }
$sampleRows = @(Import-Csv -LiteralPath $source -Encoding UTF8 |
    Where-Object { $ghostIds.ContainsKey($_.user_id) } | Sort-Object { [int]$_.id })
$sequence = 0
$profiles = @(foreach ($row in $sampleRows) {
    $sequence++
    if ($row.is_public -ne '1' -or $row.id -notmatch '^\d+$') { continue }
    # Match SyncTalentImages: ghost profiles sorted by ID map to folders 1..100.
    $folder = Join-Path $imageRoot ([string]$sequence)
    if (-not (Test-Path -LiteralPath $folder -PathType Container)) { continue }
    $images = @(Get-ChildItem -LiteralPath $folder -File | Where-Object {
        $_.Extension -match '^\.(jpg|jpeg|png|webp)$'
    } | Sort-Object Name)
    if (-not ($images | Where-Object { $_.BaseName -eq 'avatar' })) { continue }

    $profile = [ordered]@{}
    foreach ($field in $fields) {
        if ($field -in $arrayFields) {
            $items = if ($row.$field) { ConvertFrom-Json -InputObject $row.$field } else { @() }
            # Enumerate explicitly: Windows PowerShell otherwise serializes array wrappers as {value, Count}.
            $profile[$field] = @($items | ForEach-Object { [string]$_ })
        } else {
            $profile[$field] = $row.$field
        }
    }
    $profile['photos'] = @($images | ForEach-Object {
        $category = if ($_.BaseName -eq 'avatar') { 'avatar' } elseif ($_.BaseName -eq 'cover') { 'cover' } else { 'lookbook' }
        [ordered]@{
            url = "/mock_data/Talent_Image/$sequence/$([uri]::EscapeDataString($_.Name))"
            category = $category
            is_primary = ($category -eq 'avatar')
        }
    })
    # Fictional public channels, stable across rebuilds and never copied from account credentials.
    $profileId = [int]$row.id
    $handle = "onstage_demo_$profileId"
    $facebookHandle = "onstage.demo.$profileId"
    $profile['social_accounts'] = @(
        New-MockSocialAccount $profileId 1 'TikTok' $handle "https://www.tiktok.com/@$handle"
        New-MockSocialAccount $profileId 2 'TikTok' "$($handle)_daily" "https://www.tiktok.com/@$($handle)_daily"
        New-MockSocialAccount $profileId 3 'Facebook' $facebookHandle "https://www.facebook.com/$facebookHandle"
        New-MockSocialAccount $profileId 4 'Instagram' $handle "https://www.instagram.com/$handle/"
        if ($profileId % 5 -lt 3) {
            New-MockSocialAccount $profileId 5 'YouTube' $handle "https://www.youtube.com/@$handle"
        }
    )
    $profile
})
if ($profiles.Count -eq 0) { throw 'No public sample profiles with avatars found.' }
$json = ConvertTo-Json -InputObject $profiles -Depth 8
[System.IO.File]::WriteAllText($outputPath, $json, (New-Object System.Text.UTF8Encoding($false)))
Write-Output "Generated $($profiles.Count) public sample profiles."
