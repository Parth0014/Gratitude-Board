$ErrorActionPreference = 'Stop'
$workspace = (Resolve-Path -LiteralPath '.').Path
$source = (Resolve-Path -LiteralPath 'vendor/tldraw').Path
$comparison = [System.StringComparison]::OrdinalIgnoreCase
if (-not $source.Equals((Join-Path $workspace 'vendor/tldraw'), $comparison)) {
  throw 'Vendored source is outside the expected workspace path.'
}

$oldDirectories = @(
  '.cache', '.github', '.husky', '.npm-cache', '.vscode',
  'apps', 'db', 'infra', 'node_modules', 'packages', 'scripts',
  'services', 'test-results', 'tests', 'tmp'
)
$oldFiles = @(
  '.editorconfig', '.env.example', '.gitattributes', '.gitignore',
  '.node-version', '.npmrc', '.nvmrc', '.prettierignore', '.prettierrc.json',
  'AGENTS.md', 'compose.yaml', 'CONTRIBUTING.md', 'eslint.config.mjs',
  'package-lock.json', 'package.json', 'playwright.config.ts',
  'README.md', 'SECURITY.md', 'tsconfig.base.json', 'tsconfig.tools.json',
  'vitest.config.ts'
)

foreach ($name in @('EDITOR_FEATURE_MATRIX.md', 'PHOTO_CREDITS.md', 'UI_SYSTEM.md')) {
  $path = Join-Path $workspace $name
  if (Test-Path -LiteralPath $path) {
    Move-Item -LiteralPath $path -Destination (Join-Path $workspace "docs/legacy-branch-backup/$name")
  }
}

foreach ($name in ($oldDirectories + $oldFiles)) {
  $path = Join-Path $workspace $name
  if (-not (Test-Path -LiteralPath $path)) { continue }
  $resolved = (Resolve-Path -LiteralPath $path).Path
  if (-not $resolved.StartsWith(($workspace + '\'), $comparison)) {
    throw "Refusing to remove a path outside the workspace: $resolved"
  }
  Remove-Item -LiteralPath $resolved -Recurse -Force
}

foreach ($item in (Get-ChildItem -LiteralPath $source -Force)) {
  $destination = Join-Path $workspace $item.Name
  if (Test-Path -LiteralPath $destination) {
    throw "Root destination already exists: $destination"
  }
  Move-Item -LiteralPath $item.FullName -Destination $destination
}

$vendor = (Resolve-Path -LiteralPath 'vendor').Path
if (-not $vendor.Equals((Join-Path $workspace 'vendor'), $comparison)) {
  throw 'Vendor cleanup target is outside the workspace.'
}
Remove-Item -LiteralPath $vendor -Recurse -Force
