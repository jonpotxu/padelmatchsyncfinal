# supabaseClient
Get-ChildItem -Recurse -File .\pages\landing\ -Include *.js,*.jsx,*.ts,*.tsx |
  ForEach-Object {
    (Get-Content $_.FullName) `
      -replace '\.\./\.\./lib/supabaseClient', '../../../lib/supabaseClient' `
      -replace '\.\./\.\./utils/', '../../../utils/' |
    Set-Content $_.FullName
  }