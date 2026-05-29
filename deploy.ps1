# BBA All Semesters — GitHub + Pages deploy
# Run: .\deploy.ps1

$ErrorActionPreference = "Stop"
$RepoName = "bba-all-semesters"

Set-Location $PSScriptRoot

gh auth status 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "GitHub login required. Follow the browser prompt:" -ForegroundColor Yellow
    gh auth login --web --git-protocol https
}

$owner = gh api user --jq .login
$full = "$owner/$RepoName"

Write-Host "Deploying to github.com/$full ..." -ForegroundColor Cyan

gh repo view $full 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    gh repo create $RepoName --public --source=. --remote=origin --push `
        --description "BBA All Semesters — KU BS(BBA) 8-semester study tracker"
} else {
    $hasOrigin = git remote get-url origin 2>$null
    if (-not $hasOrigin) {
        git remote add origin "https://github.com/$full.git"
    }
    git push -u origin main
}

Write-Host "Enabling GitHub Pages..." -ForegroundColor Cyan
$pagesJson = '{"build_type":"legacy","source":{"branch":"main","path":"/"}}'
$pagesJson | gh api -X POST "/repos/$full/pages" --input - 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    $pagesJson | gh api -X PUT "/repos/$full/pages" --input - 2>$null | Out-Null
}

Write-Host ""
Write-Host "Live URL: https://$owner.github.io/$RepoName/" -ForegroundColor Green
Write-Host "(Allow 1-2 minutes for Pages to build)" -ForegroundColor Gray
